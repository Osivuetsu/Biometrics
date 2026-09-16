import numpy as np
import cv2
from utils.image_utils import resize_image, is_valid_image


def preprocess_for_recognition(image: np.ndarray) -> np.ndarray:
    """
    Full preprocessing pipeline before face detection/embedding.
    - Validate image
    - Resize to manageable dimension
    - Convert to uint8 if needed
    """
    if not is_valid_image(image):
        raise ValueError("Invalid image provided")

    # Ensure uint8
    if image.dtype != np.uint8:
        image = (image * 255).astype(np.uint8)

    # Resize large images
    image = resize_image(image, max_dim=640)

    return image


def align_face(face_image: np.ndarray, target_size: tuple = (160, 160)) -> np.ndarray:
    """Resize a cropped face to the target size expected by the embedding model."""
    return cv2.resize(face_image, target_size, interpolation=cv2.INTER_LINEAR)


def equalize_histogram(image: np.ndarray) -> np.ndarray:
    """Apply CLAHE histogram equalization to improve contrast in low-light images."""
    if len(image.shape) == 3:
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l = clahe.apply(l)
        lab = cv2.merge([l, a, b])
        return cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
    else:
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        return clahe.apply(image)
