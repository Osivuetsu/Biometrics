import base64
import numpy as np
from PIL import Image
import io
import os


MAX_SIZE_MB = float(os.getenv("MAX_IMAGE_SIZE_MB", 5))


def base64_to_numpy(base64_string: str) -> np.ndarray:
    """Convert a base64 image string to a numpy array (BGR for OpenCV)."""
    # Strip data URI prefix if present (e.g. "data:image/jpeg;base64,...")
    if "," in base64_string:
        base64_string = base64_string.split(",", 1)[1]

    raw = base64.b64decode(base64_string)

    size_mb = len(raw) / (1024 * 1024)
    if size_mb > MAX_SIZE_MB:
        raise ValueError(f"Image size {size_mb:.1f}MB exceeds limit of {MAX_SIZE_MB}MB")

    image = Image.open(io.BytesIO(raw)).convert("RGB")
    return np.array(image)


def numpy_to_base64(image: np.ndarray) -> str:
    """Convert a numpy array image back to base64 PNG string."""
    pil_image = Image.fromarray(image.astype(np.uint8))
    buffer = io.BytesIO()
    pil_image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")
