import numpy as np
from collections import Counter
import face_recognition as fr

from core.face_detector import detect_faces, detect_single_face
from core.distance_matcher import match_embedding_against_all, euclidean_distance
from core.threshold_manager import get_recognition_threshold
from utils.base64_utils import base64_to_numpy
from utils.image_utils import resize_image
from utils.quality_checker import check_face_quality
from utils.vector_utils import json_to_vector
from database.mysql_connection import execute_query
import os

CONFIRMATION_FRAMES = int(os.getenv("CONFIRMATION_FRAMES", "3"))


def _get_candidates(course_id=None):
    if course_id:
        return execute_query(
            """
            SELECT fe.student_id, fe.embedding_vector, s.name, s.matric_no
            FROM face_embeddings fe
            JOIN students s ON fe.student_id = s.student_id
            JOIN enrollments e ON s.student_id = e.student_id
            WHERE e.course_id = %s
            """,
            (course_id,)
        )
    return execute_query(
        """
        SELECT fe.student_id, fe.embedding_vector, s.name, s.matric_no
        FROM face_embeddings fe
        JOIN students s ON fe.student_id = s.student_id
        """
    )


def _get_embedding_from_full_image(image: np.ndarray) -> np.ndarray:
    """
    Generate embedding from full image using face_recognition.
    Exactly mirrors the reference code approach.
    """
    if image.dtype != np.uint8:
        image = (image * 255).astype(np.uint8)
    image = resize_image(image, max_dim=640)

    face_locations = fr.face_locations(image, model="hog")
    if not face_locations:
        raise ValueError("No face detected in the image")

    encodings = fr.face_encodings(image, face_locations)
    if not encodings:
        raise ValueError("Could not generate face encoding")

    return np.array(encodings[0], dtype=np.float64)


def recognize_face(image_base64: str, course_id: int = None) -> dict:

    print(f"Recognition called — course_id: {course_id}")
    """
    Single frame face recognition.
    Uses face_recognition (dlib) — same approach as reference code.
    """
    image = base64_to_numpy(image_base64)

    # Quality check
    quality = check_face_quality(image)
    if not quality["passed"]:
        return {"matched": False, "message": quality["message"], "quality_failed": True}

    try:
        query_embedding = _get_embedding_from_full_image(image)
    except ValueError as e:
        return {"matched": False, "message": str(e)}

    candidates = _get_candidates(course_id)
    if not candidates:
        return {"matched": False, "message": "No enrolled face embeddings found"}

    print(f"Candidates found: {len(candidates)}")  # ADD THIS TOO
    best_match = match_embedding_against_all(query_embedding, candidates)
    if not best_match:
        return {"matched": False, "message": "No matching student found"}

    return {
        "matched": True,
        "student_id": best_match["student_id"],
        "name": best_match["name"],
        "matric_no": best_match["matric_no"],
        "distance_score": best_match["distance_score"],
    }


def recognize_face_confirmed(images_base64: list, course_id: int = None) -> dict:
    """
    Multi-frame confirmation — runs recognition on each frame,
    confirms identity only when CONFIRMATION_FRAMES frames agree.
    Prevents a single bad frame from marking false attendance.
    """
    if not images_base64:
        return {"matched": False, "message": "No frames provided"}

    candidates = _get_candidates(course_id)
    if not candidates:
        return {"matched": False, "message": "No enrolled face embeddings found"}

    votes = []
    distances = []
    frame_results = []

    for i, b64 in enumerate(images_base64):
        try:
            image = base64_to_numpy(b64)

            quality = check_face_quality(image)
            if not quality["passed"]:
                frame_results.append({"frame": i + 1, "status": "quality_failed", "reason": quality["message"]})
                continue

            query_embedding = _get_embedding_from_full_image(image)
            best_match = match_embedding_against_all(query_embedding, candidates)

            if best_match:
                votes.append(best_match["student_id"])
                distances.append(best_match["distance_score"])
                frame_results.append({
                    "frame": i + 1,
                    "status": "matched",
                    "student_id": best_match["student_id"],
                    "distance": best_match["distance_score"],
                })
            else:
                votes.append(None)
                frame_results.append({"frame": i + 1, "status": "no_match"})

        except Exception as e:
            frame_results.append({"frame": i + 1, "status": "error", "reason": str(e)})
            continue

    valid_votes = [v for v in votes if v is not None]
    if not valid_votes:
        return {
            "matched": False,
            "confirmed": False,
            "message": "No student matched in any frame",
            "frames": frame_results,
        }

    vote_counts = Counter(valid_votes)
    top_student_id, top_count = vote_counts.most_common(1)[0]
    confirmed = top_count >= CONFIRMATION_FRAMES

    confirmed_distances = [distances[i] for i, v in enumerate(votes) if v == top_student_id]
    avg_distance = float(np.mean(confirmed_distances)) if confirmed_distances else None

    student_info = next((c for c in candidates if c["student_id"] == top_student_id), None)

    return {
        "matched": True,
        "confirmed": confirmed,
        "student_id": top_student_id,
        "name": student_info["name"] if student_info else None,
        "matric_no": student_info["matric_no"] if student_info else None,
        "distance_score": round(avg_distance, 6) if avg_distance is not None else None,
        "votes": top_count,
        "frames_analyzed": len(images_base64),
        "frames_matched": len(valid_votes),
        "confirmation_required": CONFIRMATION_FRAMES,
        "frames": frame_results,
        "message": "Identity confirmed" if confirmed else f"Only {top_count}/{CONFIRMATION_FRAMES} frames matched — try again",
    }


def recognize_faces_multi(image_base64: str, course_id: int = None) -> dict:
    """
    Multi-face recognition — detects all faces in one frame,
    matches each one. Mirrors reference code's loop approach.
    """
    image = base64_to_numpy(image_base64)

    if image.dtype != np.uint8:
        image = (image * 255).astype(np.uint8)
    image = resize_image(image, max_dim=640)

    # Detect all face locations — same as reference code
    face_locations = fr.face_locations(image, model="hog")

    if not face_locations:
        return {
            "faces_detected": 0,
            "matched_count": 0,
            "unmatched_count": 0,
            "matches": [],
            "message": "No faces detected in the image"
        }

    # Generate encodings for all faces at once — efficient batch processing
    all_encodings = fr.face_encodings(image, face_locations)

    candidates = _get_candidates(course_id)
    if not candidates:
        return {
            "faces_detected": len(face_locations),
            "matched_count": 0,
            "unmatched_count": len(face_locations),
            "matches": [],
            "message": "No enrolled face embeddings found"
        }

    matches = []
    unmatched = 0
    seen_student_ids = set()
    threshold = get_recognition_threshold()

    # Loop through each detected face — mirrors reference code pattern
    for encoding in all_encodings:
        query_embedding = np.array(encoding, dtype=np.float64)
        remaining = [c for c in candidates if c["student_id"] not in seen_student_ids]

        if not remaining:
            unmatched += 1
            continue

        # Compute distances to all candidates — same as reference code
        stored_vectors = np.array([
            json_to_vector(c["embedding_vector"]).astype(np.float64)
            for c in remaining
        ])
        distances = np.linalg.norm(stored_vectors - query_embedding, axis=1)
        min_idx = int(np.argmin(distances))
        min_distance = float(distances[min_idx])

        if min_distance <= threshold:
            matched_candidate = remaining[min_idx]
            seen_student_ids.add(matched_candidate["student_id"])
            matches.append({
                "matched": True,
                "student_id": matched_candidate["student_id"],
                "name": matched_candidate["name"],
                "matric_no": matched_candidate["matric_no"],
                "distance_score": round(min_distance, 6),
            })
        else:
            unmatched += 1

    return {
        "faces_detected": len(face_locations),
        "matched_count": len(matches),
        "unmatched_count": unmatched,
        "matches": matches,
    }
