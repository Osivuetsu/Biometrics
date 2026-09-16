import numpy as np
import face_recognition as fr
from core.distance_matcher import match_embedding_against_one
from core.threshold_manager import get_verification_threshold
from utils.base64_utils import base64_to_numpy
from utils.image_utils import resize_image
from utils.vector_utils import json_to_vector
from database.mysql_connection import execute_one


def verify_student(student_id: int, image_base64: str) -> dict:
    """
    1:1 verification — confirm image matches stored embedding for a specific student.
    """
    row = execute_one(
        "SELECT embedding_vector FROM face_embeddings WHERE student_id = %s LIMIT 1",
        (student_id,)
    )

    if not row:
        return {
            "verified": False,
            "message": "No face enrolled for this student",
            "student_id": student_id,
        }

    image = base64_to_numpy(image_base64)
    if image.dtype != np.uint8:
        image = (image * 255).astype(np.uint8)
    image = resize_image(image, max_dim=640)

    face_locations = fr.face_locations(image, model="hog")
    if not face_locations:
        return {"verified": False, "message": "No face detected in image", "student_id": student_id}

    encodings = fr.face_encodings(image, face_locations)
    if not encodings:
        return {"verified": False, "message": "Could not generate face encoding", "student_id": student_id}

    query_embedding = np.array(encodings[0], dtype=np.float64)
    threshold = get_verification_threshold()

    is_match, distance = match_embedding_against_one(
        query_embedding,
        row["embedding_vector"],
        threshold,
    )

    return {
        "verified": is_match,
        "student_id": student_id,
        "distance_score": distance,
        "threshold": threshold,
        "message": "Identity verified" if is_match else "Identity not verified",
    }
