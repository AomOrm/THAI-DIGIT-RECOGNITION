import json
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Optional

import joblib
import numpy as np

from .config import (
    ACTIVE_MODEL_FILE,
    ALLOWED_MODEL_SUFFIXES,
    CLASSES,
    MODELS_DIR,
    RUNNABLE_MODEL_SUFFIXES,
)


def ensure_model_dir() -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)


def _now_date() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def _metadata_path(model_path: Path) -> Path:
    return model_path.with_suffix(model_path.suffix + ".json")


def load_active_metadata() -> Optional[dict]:
    if not ACTIVE_MODEL_FILE.exists():
        return None
    with ACTIVE_MODEL_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_active_metadata(metadata: dict) -> None:
    ensure_model_dir()
    with ACTIVE_MODEL_FILE.open("w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)


def model_info(model_path: Path, accuracy: Optional[float] = None) -> dict:
    stat = model_path.stat()
    info = {
        "name": model_path.name,
        "date": _now_date(),
        "accuracy": accuracy,
        "size": round(stat.st_size / 1024),
        "runnable": model_path.suffix.lower() in RUNNABLE_MODEL_SUFFIXES,
    }
    sidecar = _metadata_path(model_path)
    if sidecar.exists():
        with sidecar.open("r", encoding="utf-8") as f:
            info.update(json.load(f))
        info["name"] = model_path.name
        info["size"] = round(stat.st_size / 1024)
        info["runnable"] = model_path.suffix.lower() in RUNNABLE_MODEL_SUFFIXES
    return info


def list_models() -> list:
    ensure_model_dir()
    models = []
    active = load_active_metadata()
    active_name = active.get("name") if active else None
    for path in sorted(MODELS_DIR.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True):
        if path.suffix.lower() not in ALLOWED_MODEL_SUFFIXES:
            continue
        info = model_info(path)
        info["active"] = info["name"] == active_name
        models.append(info)
    return models


def set_active_model(name: str) -> dict:
    path = (MODELS_DIR / name).resolve()
    if not path.exists() or path.parent != MODELS_DIR.resolve():
        raise FileNotFoundError(name)
    if path.suffix.lower() not in ALLOWED_MODEL_SUFFIXES:
        raise ValueError("Unsupported model file type")
    info = model_info(path)
    save_active_metadata(info)
    return info


def save_uploaded_model(src_path: Path, filename: str) -> dict:
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_MODEL_SUFFIXES:
        raise ValueError("Unsupported model file type")
    ensure_model_dir()
    safe_name = Path(filename).name
    dest = MODELS_DIR / safe_name
    if dest.exists():
        stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
        dest = MODELS_DIR / f"{dest.stem}_{stamp}{dest.suffix}"
    shutil.copyfile(src_path, dest)
    return set_active_model(dest.name)


def save_trained_metadata(
    model_path: Path,
    accuracy: float,
    samples: int,
    algorithm: Optional[str] = None,
    activate: bool = True,
) -> None:
    metadata = {
        "date": _now_date(),
        "accuracy": accuracy,
        "samples": samples,
        "runnable": model_path.suffix.lower() in RUNNABLE_MODEL_SUFFIXES,
    }
    if algorithm:
        metadata["algorithm"] = algorithm
    with _metadata_path(model_path).open("w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    if activate and model_path.parent.resolve() == MODELS_DIR.resolve():
        save_active_metadata(model_info(model_path, accuracy=accuracy))


def predict(features: np.ndarray) -> dict:
    metadata = load_active_metadata()
    if not metadata:
        raise RuntimeError("ยังไม่มีโมเดล active กรุณาเก็บข้อมูลแล้ว train ก่อน")

    model_path = MODELS_DIR / metadata["name"]
    if model_path.suffix.lower() not in RUNNABLE_MODEL_SUFFIXES:
        raise RuntimeError("โมเดล active ไม่ใช่ .joblib/.pkl ที่ backend นี้รันได้")

    model = joblib.load(model_path)
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(features)[0]
        model_classes = list(model.classes_)
        class_probs: Dict[str, float] = {label: 0.0 for label in CLASSES}
        for label, prob in zip(model_classes, probs):
            class_probs[str(label)] = float(prob)
    else:
        label = str(model.predict(features)[0])
        class_probs = {c: 0.0 for c in CLASSES}
        class_probs[label] = 1.0

    ordered = [class_probs[c] for c in CLASSES]
    idx = int(np.argmax(ordered))
    return {
        "prediction": CLASSES[idx],
        "confidence": ordered[idx],
        "all_probs": class_probs,
        "model": metadata,
    }
