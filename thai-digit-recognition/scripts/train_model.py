#!/usr/bin/env python3
import argparse
import os
import sys
from collections import Counter
from pathlib import Path
from typing import Optional

os.environ.setdefault("LOKY_MAX_CPU_COUNT", "1")

import joblib
import numpy as np
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.config import CLASSES, MODELS_DIR, SAMPLES_DIR  # noqa: E402
from backend.image_utils import preprocess_file  # noqa: E402
from backend.model_store import save_trained_metadata, set_active_model  # noqa: E402


MODEL_SPECS = {
    "knn": {
        "name": "KNN",
        "filename": "thai_digit_knn.joblib",
    },
    "svm": {
        "name": "SVM",
        "filename": "thai_digit_svm.joblib",
    },
    "random_forest": {
        "name": "Random Forest",
        "filename": "thai_digit_random_forest.joblib",
    },
    "logistic_regression": {
        "name": "Logistic Regression",
        "filename": "thai_digit_logistic_regression.joblib",
    },
    "mlp": {
        "name": "MLP",
        "filename": "thai_digit_mlp.joblib",
    },
}


def collect_samples(samples_dir: Path):
    paths = []
    labels = []
    for label in CLASSES:
        for path in sorted((samples_dir / label).glob("*.png")):
            paths.append(path)
            labels.append(label)
    return paths, labels


def load_features(paths):
    if not paths:
        return np.empty((0, 784), dtype=np.float32)
    return np.vstack([preprocess_file(path) for path in paths]).astype(np.float32)


def augment(X, y):
    augmented_x = [X]
    augmented_y = [np.asarray(y)]
    images = X.reshape((-1, 28, 28))
    for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, 1)]:
        shifted = np.roll(images, shift=(dy, dx), axis=(1, 2))
        if dy > 0:
            shifted[:, :dy, :] = 0
        elif dy < 0:
            shifted[:, dy:, :] = 0
        if dx > 0:
            shifted[:, :, :dx] = 0
        elif dx < 0:
            shifted[:, :, dx:] = 0
        augmented_x.append(shifted.reshape((-1, 784)))
        augmented_y.append(np.asarray(y))
    return np.vstack(augmented_x), np.concatenate(augmented_y)


def can_stratify(labels):
    counts = Counter(labels)
    return len(counts) > 1 and min(counts.values()) >= 2


def build_model(model_key: str, y_train):
    if model_key == "knn":
        min_class_count = min(Counter(y_train).values())
        n_neighbors = min(5, min_class_count)
        if n_neighbors > 1 and n_neighbors % 2 == 0:
            n_neighbors -= 1
        return KNeighborsClassifier(
            n_neighbors=max(1, n_neighbors),
            weights="distance",
            metric="euclidean",
            n_jobs=1,
        )

    if model_key == "svm":
        return SVC(kernel="rbf", C=8.0, gamma="scale", probability=True, random_state=42)

    if model_key == "random_forest":
        return RandomForestClassifier(
            n_estimators=250,
            max_depth=None,
            min_samples_leaf=1,
            random_state=42,
            n_jobs=1,
        )

    if model_key == "logistic_regression":
        return LogisticRegression(
            C=2.0,
            max_iter=2000,
            solver="liblinear",
            random_state=42,
        )

    if model_key == "mlp":
        return MLPClassifier(
            hidden_layer_sizes=(128, 64),
            activation="relu",
            alpha=0.001,
            max_iter=800,
            early_stopping=False,
            random_state=42,
        )

    raise ValueError(f"Unknown model: {model_key}")


def model_output_path(model_key: str, output_dir: Path, output: Optional[Path]) -> Path:
    if output is not None:
        return output
    return output_dir / MODEL_SPECS[model_key]["filename"]


def train_one(model_key, X_train, y_train, X_test, y_test, samples, output_dir, output=None):
    spec = MODEL_SPECS[model_key]
    print(f"\n== {spec['name']} ==")
    model = build_model(model_key, y_train)
    model.fit(X_train, y_train)

    pred = model.predict(X_test)
    accuracy = float(accuracy_score(y_test, pred))
    print(f"accuracy: {accuracy:.4f}")
    print(classification_report(y_test, pred, labels=CLASSES, zero_division=0))

    output_path = model_output_path(model_key, output_dir, output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, output_path)
    save_trained_metadata(
        output_path,
        accuracy=accuracy,
        samples=samples,
        algorithm=spec["name"],
        activate=False,
    )
    print(f"saved: {output_path}")
    return {"key": model_key, "name": spec["name"], "path": output_path, "accuracy": accuracy}


def main():
    parser = argparse.ArgumentParser(description="Train a Thai digit classifier.")
    parser.add_argument("--samples-dir", type=Path, default=SAMPLES_DIR)
    parser.add_argument(
        "--model",
        choices=[*MODEL_SPECS.keys(), "all"],
        default="all",
        help="Which model to train. Default trains every runnable sklearn model.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Output path for a single --model run.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=MODELS_DIR,
        help="Directory for trained .joblib files when --output is not used.",
    )
    parser.add_argument("--test-size", type=float, default=0.25)
    parser.add_argument("--no-augment", action="store_true")
    args = parser.parse_args()

    if args.model == "all" and args.output is not None:
        raise SystemExit("--output can only be used when training one model.")

    paths, labels = collect_samples(args.samples_dir)
    counts = Counter(labels)
    print("samples:", dict(counts))

    if len(counts) < 2:
        raise SystemExit("Need samples from at least 2 classes before training.")

    X = load_features(paths)
    y = np.asarray(labels)

    if can_stratify(labels) and len(paths) >= 8:
        train_idx, test_idx = train_test_split(
            np.arange(len(paths)),
            test_size=args.test_size,
            random_state=42,
            stratify=y,
        )
        X_train, y_train = X[train_idx], y[train_idx]
        X_test, y_test = X[test_idx], y[test_idx]
    else:
        X_train, y_train = X, y
        X_test, y_test = X, y
        print("warning: not enough balanced data for a holdout set; reporting training accuracy")

    if not args.no_augment:
        X_train, y_train = augment(X_train, y_train)

    model_keys = list(MODEL_SPECS.keys()) if args.model == "all" else [args.model]
    results = [
        train_one(
            model_key,
            X_train,
            y_train,
            X_test,
            y_test,
            samples=len(paths),
            output_dir=args.output_dir,
            output=args.output,
        )
        for model_key in model_keys
    ]

    print("\nsummary:")
    for result in sorted(results, key=lambda item: item["accuracy"], reverse=True):
        print(f"- {result['name']}: {result['accuracy']:.4f} ({result['path'].name})")

    runnable_results = [
        result for result in results if result["path"].parent.resolve() == MODELS_DIR.resolve()
    ]
    if runnable_results:
        best = max(runnable_results, key=lambda item: item["accuracy"])
        set_active_model(best["path"].name)
        print(f"active model: {best['path'].name}")
    else:
        print("active model unchanged: output is outside models/")


if __name__ == "__main__":
    main()
