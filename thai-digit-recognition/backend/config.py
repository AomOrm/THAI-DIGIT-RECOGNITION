from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data"
SAMPLES_DIR = DATA_DIR / "samples"
MODELS_DIR = PROJECT_ROOT / "models"
ACTIVE_MODEL_FILE = MODELS_DIR / "active_model.json"

CLASSES = ["๑๖", "๑๗", "๑๘", "๑๙", "๒๐"]
ARABIC = {
    "๑๖": "16",
    "๑๗": "17",
    "๑๘": "18",
    "๑๙": "19",
    "๒๐": "20",
}

ALLOWED_MODEL_SUFFIXES = {".joblib", ".pkl", ".h5", ".pt"}
RUNNABLE_MODEL_SUFFIXES = {".joblib", ".pkl"}
