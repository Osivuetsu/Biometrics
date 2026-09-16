import numpy as np
from core.face_detector import detect_faces
from core.embedding_generator import generate_embedding, generate_embedding_from_multiple
from utils.base64_utils import base64_to_numpy
from utils.vector_utils import vector_to_json
from utils.quality_checker import check_enrollment_quality
from database.mysql_connection import execute_query


def enroll_student(student_id: int, image_base64: str) -> dict:
    """
    Single image enrollment with quality check.
    """
    image = base64_to_numpy(image_base64)
    faces = detect_faces(image)

    quality = check_enrollment_quality(image, faces)
    if not quality["passed"]:
        raise ValueError(quality["message"])

    embedding = generate_embedding(image)
    embedding_json = vector_to_json(embedding)

    existing = execute_query(
        "SELECT embedding_id FROM face_embeddings WHERE student_id = %s",
        (student_id,)
    )

    if existing:
        execute_query(
            "UPDATE face_embeddings SET embedding_vector = %s WHERE student_id = %s",
            (embedding_json, student_id),
            fetch=False,
        )
        embedding_id = existing[0]["embedding_id"]
    else:
        embedding_id = execute_query(
            "INSERT INTO face_embeddings (student_id, embedding_vector) VALUES (%s, %s)",
            (student_id, embedding_json),
            fetch=False,
        )

    return {"embedding_id": embedding_id, "student_id": student_id}


def enroll_student_multi(student_id: int, images_base64: list) -> dict:
    """
    Multi-image enrollment:
    - Quality check each image
    - Keep images that pass
    - Average embeddings from good images
    - Requires at least 2 good images
    """
    if len(images_base64) < 2:
        raise ValueError("At least 2 images required")

    good_images = []
    rejected = []

    for i, b64 in enumerate(images_base64):
        try:
            image = base64_to_numpy(b64)
            faces = detect_faces(image)
            quality = check_enrollment_quality(image, faces)

            if quality["passed"]:
                good_images.append(image)
            else:
                rejected.append({"index": i, "reason": quality["message"]})
        except Exception as e:
            rejected.append({"index": i, "reason": str(e)})

    if len(good_images) < 2:
        raise ValueError(
            f"Only {len(good_images)} image(s) passed quality check. "
            f"Need at least 2. Issues: {[r['reason'] for r in rejected[:3]]}"
        )

    averaged_embedding = generate_embedding_from_multiple(good_images)
    embedding_json = vector_to_json(averaged_embedding)

    existing = execute_query(
        "SELECT embedding_id FROM face_embeddings WHERE student_id = %s",
        (student_id,)
    )

    if existing:
        execute_query(
            "UPDATE face_embeddings SET embedding_vector = %s WHERE student_id = %s",
            (embedding_json, student_id),
            fetch=False,
        )
        embedding_id = existing[0]["embedding_id"]
    else:
        embedding_id = execute_query(
            "INSERT INTO face_embeddings (student_id, embedding_vector) VALUES (%s, %s)",
            (student_id, embedding_json),
            fetch=False,
        )

    return {
        "embedding_id": embedding_id,
        "student_id": student_id,
        "images_submitted": len(images_base64),
        "images_used": len(good_images),
        "images_rejected": len(rejected),
    }


def delete_enrollment(student_id: int) -> dict:
    execute_query(
        "DELETE FROM face_embeddings WHERE student_id = %s",
        (student_id,),
        fetch=False,
    )
    return {"message": f"Embeddings deleted for student {student_id}"}
