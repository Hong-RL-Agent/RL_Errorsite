from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

images = [
    {"id": 1, "name": "Sunset.jpg", "size": "1.2MB", "type": "image/jpeg"},
    {"id": 2, "name": "Mountain.png", "size": "3.5MB", "type": "image/png"},
    {"id": 3, "name": "Ocean.webp", "size": "800KB", "type": "image/webp"}
]

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"ok": True, "site": "site051", "status": "healthy", "engine": "python/flask"})

@app.route('/api/gallery', methods=['GET'])
def get_gallery():
    # --- BUG 01: metadata-mismatch ---
    return jsonify({
        "data": images,
        "bugId": "site051-bug01"
    })

@app.route('/api/upload/status', methods=['GET'])
def upload_status():
    # --- BUG 02: upload-race-condition ---
    return jsonify({
        "status": "completed",
        "progress": 70,
        "bugId": "site051-bug02"
    })

@app.route('/api/thumbnail/generate', methods=['POST'])
def generate_thumbnail():
    # --- BUG 03: thumbnail-generation-failure-silent ---
    return jsonify({
        "success": True,
        "thumbnailUrl": None,
        "bugId": "site051-bug03"
    })

@app.route('/api/mapping/path', methods=['GET'])
def get_mapping():
    # --- BUG 04: file-path-mapping-error ---
    return jsonify({
        "path": "/wrong/directory/path",
        "bugId": "site051-bug04"
    })

if __name__ == '__main__':
    app.run(port=9160, debug=True)
