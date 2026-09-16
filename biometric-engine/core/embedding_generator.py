import numpy as np
import face_recognition
from utils.image_utils import resize_image


def generate_embedding(image: np.ndarray) -> np.ndarray:
    """
    Generate a 128-dimensional face embedding using face_recognition (dlib).
    Passes full image — face_recognition handles detection and cropping internally.
    Returns a 1D numpy float64 array (matching reference code dtype).
    """
    if image.dtype != np.uint8:
        image = (image * 255).astype(np.uint8)

    image = resize_image(image, max_dim=640)

    # Detect face locations first
    face_locations = face_recognition.face_locations(image, model="hog")

    if not face_locations:
        raise ValueError("No face detected — could not generate embedding")

    # Generate encodings from detected face locations
    encodings = face_recognition.face_encodings(image, face_locations)

    if not encodings:
        raise ValueError("Could not generate face encoding")

    # Return first (or only) face encoding as float64 numpy array
    return np.array(encodings[0], dtype=np.float64)


def generate_embedding_from_crop(face_crop: np.ndarray) -> np.ndarray:
    """
    Generate embedding from a pre-cropped face image.
    Used in multi-face recognition where faces are already located.
    """
    if face_crop.dtype != np.uint8:
        face_crop = (face_crop * 255).astype(np.uint8)

    # Resize crop to minimum workable size
    if face_crop.shape[0] < 20 or face_crop.shape[1] < 20:
        raise ValueError("Face crop too small to generate embedding")

    # face_recognition on a pre-cropped face — use full image location
    h, w = face_crop.shape[:2]
    face_location = [(0, w, h, 0)]  # top, right, bottom, left

    encodings = face_recognition.face_encodings(face_crop, face_location)

    if not encodings:
        raise ValueError("Could not generate face encoding from crop")

    return np.array(encodings[0], dtype=np.float64)


def generate_embedding_from_multiple(images: list) -> np.ndarray:
    """
    Generate averaged embedding from multiple images of the same person.
    Skips images that fail encoding.
    """
    embeddings = []
    for img in images:
        try:
            emb = generate_embedding(img)
            embeddings.append(emb)
        except Exception:
            continue

    if not embeddings:
        raise ValueError("Could not generate embeddings from any of the provided images")

    return np.mean(embeddings, axis=0).astype(np.float64)
