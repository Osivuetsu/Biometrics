import cv2
import numpy as np
from PIL import Image


def resize_image(image: np.ndarray, max_dim: int = 640) -> np.ndarray:
    """Resize image so the largest dimension is max_dim, preserving aspect ratio."""
    h, w = image.shape[:2]
    if max(h, w) <= max_dim:
        return image
    scale = max_dim / max(h, w)
    new_w, new_h = int(w * scale), int(h * scale)
    return cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)


def normalize_image(image: np.ndarray) -> np.ndarray:
    """Normalize pixel values to [0, 1]."""
    return image.astype(np.float32) / 255.0


def rgb_to_bgr(image: np.ndarray) -> np.ndarray:
    """Convert RGB numpy array to BGR (for OpenCV)."""
    return cv2.cvtColor(image, cv2.COLOR_RGB2BGR)


def bgr_to_rgb(image: np.ndarray) -> np.ndarray:
    """Convert BGR (OpenCV) to RGB."""
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)


def is_valid_image(image: np.ndarray) -> bool:
    """Check if the numpy array is a valid image."""
    return (
        isinstance(image, np.ndarray)
        and image.ndim == 3
        and image.shape[2] in (1, 3, 4)
        and image.size > 0
    )
