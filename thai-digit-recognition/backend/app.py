from datetime import datetime, timezone
from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .config import CLASSES, PROJECT_ROOT, SAMPLES_DIR
from .image_utils import preprocess_data_url, save_data_url
from .model_store import (
    list_models,
    load_active_metadata,
    predict,
    save_uploaded_model,
    set_active_model,
)


app = FastAPI(title="Thai Digit Recognizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    image: str


class SaveSampleRequest(BaseModel):
    label: str
    image: str


class ActivateRequest(BaseModel):
    name: str


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/model")
def active_model():
    model = load_active_metadata()
    if not model:
        return {
            "name": "no_model",
            "date": None,
            "accuracy": None,
            "size": 0,
            "runnable": False,
        }
    return model


@app.get("/models")
def models():
    return {"active": load_active_metadata(), "models": list_models()}


@app.post("/models/activate")
def activate_model(req: ActivateRequest):
    try:
        return set_active_model(req.name)
    except (FileNotFoundError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/predict")
def run_predict(req: PredictRequest):
    try:
        features = preprocess_data_url(req.image)
        return predict(features)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@app.post("/save-sample")
def save_sample(req: SaveSampleRequest):
    if req.label not in CLASSES:
        raise HTTPException(status_code=400, detail="Unknown label")
    try:
        stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S%f")
        path = SAMPLES_DIR / req.label / f"{stamp}.png"
        save_data_url(req.image, path)
        return sample_stats()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/sample-stats")
def sample_stats():
    stats = {}
    for label in CLASSES:
        label_dir = SAMPLES_DIR / label
        stats[label] = len(list(label_dir.glob("*.png"))) if label_dir.exists() else 0
    return stats


@app.post("/upload-model")
async def upload_model(model: UploadFile = File(...)):
    with NamedTemporaryFile(delete=False) as tmp:
        tmp_path = Path(tmp.name)
        tmp.write(await model.read())
    try:
        return save_uploaded_model(tmp_path, model.filename or "model.joblib")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        tmp_path.unlink(missing_ok=True)


@app.exception_handler(HTTPException)
async def http_error_handler(_, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


app.mount("/", StaticFiles(directory=PROJECT_ROOT, html=True), name="frontend")
