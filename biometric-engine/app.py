from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

from api.recognition_routes import recognition_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(recognition_bp)


@app.errorhandler(404)
def not_found(e):
    return {"success": False, "message": "Route not found"}, 404


@app.errorhandler(405)
def method_not_allowed(e):
    return {"success": False, "message": "Method not allowed"}, 405


@app.errorhandler(500)
def internal_error(e):
    return {"success": False, "message": "Internal server error"}, 500


if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 8000))
    debug = os.getenv("FLASK_ENV", "development") == "development"
    print(f"Biometric engine running on port {port}")
    print("Using face_recognition (dlib) — no model download required")
    app.run(host="0.0.0.0", port=port, debug=debug)
