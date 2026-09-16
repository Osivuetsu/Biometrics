import numpy as np
import face_recognition
from utils.image_utils import resize_image


def detect_faces(image: np.ndarray) -> list:
    """
    Detect all faces in an image using face_recognition (dlib HOG model).
    Returns list of dicts with facial_area and face crop.
    """
    # Resize for speed — face_recognition works well at 640px
    image = resize_image(image, max_dim=640)

    # face_recognition expects RGB uint8
    if image.dtype != np.uint8:
        image = (image * 255).astype(np.uint8)

    face_locations = face_recognition.face_locations(image, model="hog")

    results = []
    for (top, right, bottom, left) in face_locations:
        # Crop the face region
        face_crop = image[top:bottom, left:right]
        results.append({
            "face": face_crop,
            "facial_area": {"x": left, "y": top, "w": right - left, "h": bottom - top},
            "confidence": 1.0,
            "location": (top, right, bottom, left),
        })

    return results


def detect_single_face(image: np.ndarray) -> dict:
    """
    Detect exactly one face. Raises ValueError if 0 or 2+ faces found.
    """
    faces = detect_faces(image)

    if len(faces) == 0:
        raise ValueError("No face detected in the image")
    if len(faces) > 1:
        raise ValueError(f"Multiple faces detected ({len(faces)}). Please provide a single face.")

    return faces[0]


def has_face(image: np.ndarray) -> bool:
    """Quick check — returns True if at least one face is detected."""
    return len(detect_faces(image)) > 0
