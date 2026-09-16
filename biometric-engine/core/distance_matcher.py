import numpy as np
from typing import List, Optional
from utils.vector_utils import json_to_vector
from core.threshold_manager import get_recognition_threshold


def euclidean_distance(v1: np.ndarray, v2: np.ndarray) -> float:
    """Raw Euclidean distance — same as reference code np.linalg.norm."""
    return float(np.linalg.norm(v1 - v2))


def match_embedding_against_all(
    query_embedding: np.ndarray,
    candidates: List[dict],
) -> Optional[dict]:
    """
    1:N recognition — match query embedding against all stored embeddings.
    Uses raw Euclidean distance matching face_recognition's approach.

    candidates: list of dicts with keys student_id, embedding_vector (JSON string)
    Returns best match dict with distance_score, or None if no match within threshold.
    """
    threshold = get_recognition_threshold()
    best = None
    best_distance = float("inf")

    for candidate in candidates:
        stored_vector = json_to_vector(candidate["embedding_vector"])

        # Ensure same dtype — face_recognition uses float64
        query = query_embedding.astype(np.float64)
        stored = stored_vector.astype(np.float64)

        distance = euclidean_distance(query, stored)

        print(f"Student {candidate['name']}: distance = {distance:.4f}, threshold = {threshold}")


        if distance < best_distance:
            best_distance = distance
            best = {**candidate, "distance_score": round(distance, 6)}

    if best and best_distance <= threshold:
        return best
    return None


def match_embedding_against_one(
    query_embedding: np.ndarray,
    stored_embedding_json: str,
    threshold: float,
) -> tuple:
    """
    1:1 verification — compare query against a single stored embedding.
    Returns (is_match: bool, distance: float).
    """
    stored = json_to_vector(stored_embedding_json).astype(np.float64)
    query = query_embedding.astype(np.float64)
    distance = euclidean_distance(query, stored)
    return distance <= threshold, round(distance, 6)
