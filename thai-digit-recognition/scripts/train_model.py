#!/usr/bin/env python3
import argparse
import os
import sys
from collections import Counter
from pathlib import Path

os.environ.setdefault("LOKY_MAX_CPU_COUNT", "1")

import joblib
import numpy as np
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.config import CLASSES, MODELS_DIR, SAMPLES_DIR  # noqa: E402
from backend.image_utils import preprocess_file  # noqa: E402
from backend.model_store import save_trained_metadata  # noqa: E402


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


def main():
    parser = argparse.ArgumentParser(description="Train a Thai digit classifier.")
    parser.add_argument("--samples-dir", type=Path, default=SAMPLES_DIR)
    parser.add_argument("--output", type=Path, default=MODELS_DIR / "thai_digit_knn.joblib")
    parser.add_argument("--test-size", type=float, default=0.25)
    parser.add_argument("--no-augment", action="store_true")
    args = parser.parse_args()

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

    min_class_count = min(Counter(y_train).values())
    n_neighbors = min(5, min_class_count)
    if n_neighbors > 1 and n_neighbors % 2 == 0:
        n_neighbors -= 1

    model = KNeighborsClassifier(
        n_neighbors=max(1, n_neighbors),
        weights="distance",
        metric="euclidean",
        n_jobs=1,
    )
    model.fit(X_train, y_train)

    pred = model.predict(X_test)
    accuracy = float(accuracy_score(y_test, pred))
    print(f"accuracy: {accuracy:.4f}")
    print(classification_report(y_test, pred, labels=CLASSES, zero_division=0))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, args.output)
    save_trained_metadata(args.output, accuracy=accuracy, samples=len(paths))
    print(f"saved: {args.output}")
    if args.output.parent.resolve() == MODELS_DIR.resolve():
        print(f"active model: {args.output.name}")
    else:
        print("active model unchanged: output is outside models/")


if __name__ == "__main__":
    main()
