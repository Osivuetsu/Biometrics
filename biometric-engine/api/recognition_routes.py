from flask import Blueprint, request, jsonify
from services.enrollment_service import enroll_student, enroll_student_multi, delete_enrollment
from services.recognition_service import recognize_face, recognize_face_confirmed, recognize_faces_multi
from services.verification_service import verify_student

recognition_bp = Blueprint("recognition", __name__, url_prefix="/api")

def error_response(message, status=400):
    return jsonify({"success": False, "message": message}), status

def success_response(data, message="Success", status=200):
    return jsonify({"success": True, "message": message, "data": data}), status


@recognition_bp.route("/enroll", methods=["POST"])
def enroll():
    body = request.get_json()
    if not body:
        return error_response("Request body is required")
    student_id = body.get("student_id")
    image = body.get("image")
    if not student_id or not image:
        return error_response("student_id and image are required")
    try:
        result = enroll_student(int(student_id), image)
        return success_response(result, "Face enrolled successfully", 201)
    except ValueError as e:
        return error_response(str(e), 422)
    except Exception as e:
        return error_response(f"Enrollment failed: {str(e)}", 500)


@recognition_bp.route("/enroll/multi", methods=["POST"])
def enroll_multi():
    body = request.get_json()
    if not body:
        return error_response("Request body is required")
    student_id = body.get("student_id")
    images = body.get("images")
    if not student_id or not images or not isinstance(images, list):
        return error_response("student_id and images (array) are required")
    if len(images) < 2:
        return error_response("Provide at least 2 images")
    try:
        result = enroll_student_multi(int(student_id), images)
        return success_response(result, f"Enrolled using {result['images_used']}/{result['images_submitted']} images", 201)
    except ValueError as e:
        return error_response(str(e), 422)
    except Exception as e:
        return error_response(f"Enrollment failed: {str(e)}", 500)


@recognition_bp.route("/recognize", methods=["POST"])
def recognize():
    """Single frame recognition."""
    body = request.get_json()
    if not body:
        return error_response("Request body is required")
    image = body.get("image")
    course_id = body.get("course_id")
    if not image:
        return error_response("image is required")
    try:
        result = recognize_face(image, int(course_id) if course_id else None)
        return success_response(result, "Recognition complete")
    except ValueError as e:
        return error_response(str(e), 422)
    except Exception as e:
        return error_response(f"Recognition failed: {str(e)}", 500)


@recognition_bp.route("/recognize/confirmed", methods=["POST"])
def recognize_confirmed():
    """
    Multi-frame confirmation recognition.
    Body: { "images": ["<base64>", ...], "course_id": int }
    Requires CONFIRMATION_FRAMES frames to agree before marking attendance.
    """
    body = request.get_json()
    if not body:
        return error_response("Request body is required")
    images = body.get("images")
    course_id = body.get("course_id")
    if not images or not isinstance(images, list):
        return error_response("images (array of base64) is required")
    try:
        result = recognize_face_confirmed(images, int(course_id) if course_id else None)
        return success_response(result, result.get("message", "Recognition complete"))
    except ValueError as e:
        return error_response(str(e), 422)
    except Exception as e:
        return error_response(f"Recognition failed: {str(e)}", 500)


@recognition_bp.route("/recognize/multi", methods=["POST"])
def recognize_multi():
    """Multi-face recognition — all faces in one frame."""
    body = request.get_json()
    if not body:
        return error_response("Request body is required")
    image = body.get("image")
    course_id = body.get("course_id")
    if not image:
        return error_response("image is required")
    try:
        result = recognize_faces_multi(image, int(course_id) if course_id else None)
        return success_response(result, f"Detected {result['faces_detected']} face(s), matched {result['matched_count']}")
    except ValueError as e:
        return error_response(str(e), 422)
    except Exception as e:
        return error_response(f"Recognition failed: {str(e)}", 500)


@recognition_bp.route("/verify", methods=["POST"])
def verify():
    body = request.get_json()
    if not body:
        return error_response("Request body is required")
    student_id = body.get("student_id")
    image = body.get("image")
    if not student_id or not image:
        return error_response("student_id and image are required")
    try:
        result = verify_student(int(student_id), image)
        return success_response(result, "Verification complete")
    except ValueError as e:
        return error_response(str(e), 422)
    except Exception as e:
        return error_response(f"Verification failed: {str(e)}", 500)


@recognition_bp.route("/embeddings/<int:student_id>", methods=["DELETE"])
def delete_embeddings(student_id):
    try:
        result = delete_enrollment(student_id)
        return success_response(result, result["message"])
    except Exception as e:
        return error_response(f"Failed to delete embeddings: {str(e)}", 500)


@recognition_bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "biometric-engine"}), 200
