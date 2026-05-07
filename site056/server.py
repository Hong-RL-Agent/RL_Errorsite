from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

reports = [
    {"id": 1, "name": "Q1 Financial Report", "status": "ready", "url": "/dl/1"},
    {"id": 2, "name": "User Metadata", "status": "pending", "url": None},
    {"id": 3, "name": "System Audit Log", "status": "ready", "url": None}
]

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"ok": True, "site": "site056", "status": "healthy", "engine": "python/flask"})

@app.route('/api/reports', methods=['GET'])
def get_reports():
    # --- BUG 01: report-status-desync ---
    return jsonify({"data": reports, "bugId": "site056-bug01"})

@app.route('/api/reports/create', methods=['POST'])
def create_report():
    # --- BUG 03: premature-ready-flag ---
    return jsonify({"created": True, "status": "ready", "bugId": "site056-bug03"})

@app.route('/api/reports/download', methods=['GET'])
def download():
    token = request.args.get('token')
    # --- BUG 02: download-token-bypass ---
    if token == "invalid":
        return jsonify({"download": True, "bugId": "site056-bug02"})
    return jsonify({"download": True})

@app.route('/api/reports/stream', methods=['GET'])
def stream():
    # --- BUG 04: stream-interruption-unhandled ---
    return jsonify({"stream": "partial", "bugId": "site056-bug04"})

if __name__ == '__main__':
    app.run(port=9165, debug=True)
