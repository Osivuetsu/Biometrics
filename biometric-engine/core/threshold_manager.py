import os

# face_recognition (dlib) uses raw Euclidean distance on 128-dim embeddings
# The reference code uses 0.6 — we use 0.55 for slightly stricter matching
# Genuine pairs typically < 0.4, impostor pairs typically > 0.6

DLIB_THRESHOLD = float(os.getenv("RECOGNITION_THRESHOLD", "0.55"))
DLIB_VERIFICATION_THRESHOLD = float(os.getenv("VERIFICATION_THRESHOLD", "0.50"))


def get_recognition_threshold() -> float:
    return float(os.getenv("RECOGNITION_THRESHOLD", str(DLIB_THRESHOLD)))


def get_verification_threshold() -> float:
    return float(os.getenv("VERIFICATION_THRESHOLD", str(DLIB_VERIFICATION_THRESHOLD)))


def is_match(distance: float, mode: str = "recognition") -> bool:
    threshold = get_recognition_threshold() if mode == "recognition" else get_verification_threshold()
    return distance <= threshold
