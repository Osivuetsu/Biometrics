import numpy as np
import cv2


def check_face_quality(image: np.ndarray, face_region: dict = None) -> dict:
    """
    Basic quality check calibrated for webcam images.
    Only checks brightness and face presence — sharpness check removed
    as webcam images are naturally soft and fail strict Laplacian thresholds.
    """
    h, w = image.shape[:2]
    issues = []

    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    else:
        gray = image

    # Brightness check only
    brightness = np.mean(gray)
    if brightness < 20:
        issues.append("Image too dark — improve lighting")
    elif brightness > 240:
        issues.append("Image too bright — reduce lighting")

    # Face size check (only if face region provided)
    if face_region:
        face_w = face_region.get('w', 0)
        face_h = face_region.get('h', 0)
        face_area_ratio = (face_w * face_h) / (w * h) if (w * h) > 0 else 0

        if face_area_ratio < 0.02:
            issues.append("Face too small — move closer to the camera")

    passed = len(issues) == 0

    return {
        "passed": passed,
        "brightness": round(float(brightness), 1),
        "issues": issues,
        "message": issues[0] if issues else "Quality check passed",
    }


def check_enrollment_quality(image: np.ndarray, faces: list) -> dict:
    """
    Quality check for enrollment.
    Requires exactly one face detected.
    """
    if len(faces) == 0:
        return {"passed": False, "message": "No face detected", "issues": ["No face detected"]}
    if len(faces) > 1:
        return {"passed": False, "message": "Multiple faces detected", "issues": ["Multiple faces in frame — ensure only one person"]}

    face = faces[0]
    facial_area = face.get("facial_area", {})
    face_region = {
        "x": facial_area.get("x", 0),
        "y": facial_area.get("y", 0),
        "w": facial_area.get("w", 0),
        "h": facial_area.get("h", 0),
    }

    return check_face_quality(image, face_region)