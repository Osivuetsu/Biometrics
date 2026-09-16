import numpy as np
import json
from typing import List


def euclidean_distance(v1: np.ndarray, v2: np.ndarray) -> float:
    """Compute standard Euclidean distance between two vectors."""
    return float(np.linalg.norm(v1 - v2))


def euclidean_l2_distance(v1: np.ndarray, v2: np.ndarray) -> float:
    """Compute L2-normalized Euclidean distance (used by DeepFace)."""
    v1_norm = v1 / (np.linalg.norm(v1) + 1e-10)
    v2_norm = v2 / (np.linalg.norm(v2) + 1e-10)
    return float(np.linalg.norm(v1_norm - v2_norm))


def cosine_distance(v1: np.ndarray, v2: np.ndarray) -> float:
    """Compute cosine distance between two vectors."""
    dot = np.dot(v1, v2)
    norm = np.linalg.norm(v1) * np.linalg.norm(v2)
    if norm == 0:
        return 1.0
    return float(1 - dot / norm)


def vector_to_json(vector: np.ndarray) -> str:
    """Serialize a numpy vector to JSON string for DB storage."""
    return json.dumps(vector.tolist())


def json_to_vector(json_str: str) -> np.ndarray:
    """Deserialize a JSON string from DB back to numpy vector."""
    if isinstance(json_str, (list, dict)):
        return np.array(json_str, dtype=np.float32)
    return np.array(json.loads(json_str), dtype=np.float32)


def find_best_match(
    query_vector: np.ndarray,
    candidates: List[dict],
    threshold: float,
    metric: str = "euclidean_l2",
) -> dict | None:
    """
    Find the closest matching embedding from a list of candidates.

    Each candidate: { "student_id": int, "embedding_vector": str|list }
    Returns the best match dict with added "distance_score", or None.
    """
    best = None
    best_distance = float("inf")

    distance_fn = {
        "euclidean": euclidean_distance,
        "euclidean_l2": euclidean_l2_distance,
        "cosine": cosine_distance,
    }.get(metric, euclidean_l2_distance)

    for candidate in candidates:
        stored_vector = json_to_vector(candidate["embedding_vector"])
        distance = distance_fn(query_vector, stored_vector)

        if distance < best_distance:
            best_distance = distance
            best = {**candidate, "distance_score": round(distance, 6)}

    if best and best_distance <= threshold:
        return best
    return None
