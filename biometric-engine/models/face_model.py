from deepface import DeepFace
import os

FACE_MODEL = os.getenv("FACE_MODEL", "Facenet512")
DETECTOR_BACKEND = os.getenv("DETECTOR_BACKEND", "retinaface")

_model_instance = None


def load_model():
    """
    Pre-load the face recognition model into memory.
    Call this once at app startup to avoid cold-start delay on first request.
    """
    global _model_instance
    if _model_instance is None:
        print(f"[FaceModel] Loading {FACE_MODEL} model...")
        # DeepFace caches internally; this call forces the download/load
        _model_instance = DeepFace.build_model(FACE_MODEL)
        print(f"[FaceModel] {FACE_MODEL} loaded successfully.")
    return _model_instance


def get_model():
    """Return the cached model instance."""
    if _model_instance is None:
        return load_model()
    return _model_instance
