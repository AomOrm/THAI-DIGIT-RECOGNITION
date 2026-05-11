import base64
import re
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image


DATA_URL_RE = re.compile(r"^data:image/(png|jpeg|jpg);base64,(?P<data>.+)$")


def decode_data_url(data_url: str) -> Image.Image:
    match = DATA_URL_RE.match(data_url or "")
    if not match:
        raise ValueError("Expected a PNG or JPEG data URL")
    raw = base64.b64decode(match.group("data"), validate=True)
    return Image.open(BytesIO(raw)).convert("RGBA")


def save_data_url(data_url: str, path: Path) -> None:
    image = decode_data_url(data_url)
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="PNG")


def preprocess_image(image: Image.Image, size: int = 28) -> np.ndarray:
    """Convert a white-background canvas image into a normalized flat vector."""
    rgba = image.convert("RGBA")
    white = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
    image = Image.alpha_composite(white, rgba).convert("L")

    arr = np.asarray(image, dtype=np.float32)
    ink = 255.0 - arr
    mask = ink > 20

    if mask.any():
        ys, xs = np.where(mask)
        x0, x1 = xs.min(), xs.max() + 1
        y0, y1 = ys.min(), ys.max() + 1
        pad = max(8, int(max(x1 - x0, y1 - y0) * 0.18))
        x0 = max(0, x0 - pad)
        y0 = max(0, y0 - pad)
        x1 = min(ink.shape[1], x1 + pad)
        y1 = min(ink.shape[0], y1 + pad)
        ink = ink[y0:y1, x0:x1]

    h, w = ink.shape
    side = max(h, w)
    square = np.zeros((side, side), dtype=np.float32)
    y = (side - h) // 2
    x = (side - w) // 2
    square[y : y + h, x : x + w] = ink

    resized = Image.fromarray(np.uint8(np.clip(square, 0, 255)), mode="L").resize(
        (size, size), Image.Resampling.LANCZOS
    )
    return (np.asarray(resized, dtype=np.float32) / 255.0).reshape(1, -1)


def preprocess_data_url(data_url: str, size: int = 28) -> np.ndarray:
    return preprocess_image(decode_data_url(data_url), size=size)


def preprocess_file(path: Path, size: int = 28) -> np.ndarray:
    return preprocess_image(Image.open(path), size=size)
