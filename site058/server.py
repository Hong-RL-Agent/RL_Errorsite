from flask import Flask, jsonify, request
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

# Mock Data
resources = [
    {"id": "i-098234", "name": "Web-Server-01", "provider": "AWS", "region": "us-east-1", "status": "Running", "cost": 120.5, "type": "t3.medium"},
    {"id": "vm-22341", "name": "DB-Primary", "provider": "Azure", "region": "korea-central", "status": "Running", "cost": 350.0, "type": "Standard_D2s_v3"},
    {"id": "gcp-9901", "name": "AI-Worker-01", "provider": "GCP", "region": "asia-northeast3", "status": "Terminated", "cost": 45.2, "type": "n1-standard-4"}
]

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "site": "site058"})

@app.route('/api/resources', methods=['GET'])
def get_resources():
    # --- BUG 01: Status Desync ---
    # List says 'Running', but we'll return it as is.
    # The 'detail' API will contradict this.
    return jsonify({
        "data": resources,
        "bugId": "site058-bug01"
    })

@app.route('/api/resources/<res_id>', methods=['GET'])
def get_resource_detail(res_id):
    res = next((r for r in resources if r['id'] == res_id), None)
    if res:
        detail = res.copy()
        # --- BUG 01 Logic: If it's Web-Server-01, show 'Stopped' in detail ---
        if res['id'] == "i-098234":
            detail['status'] = "Stopped"
            
        # --- BUG 03: Permission Leak ---
        # Include a 'privateKeyMetadata' that shouldn't be here
        detail['privateKeyInfo'] = {"fingerprint": "SHA256:abc...", "leak": "TRUE"}
        
        return jsonify({"data": detail, "bugId": "site058-bug03"})
    return jsonify({"error": "Not found"}), 404

@app.route('/api/billing/summary', methods=['GET'])
def get_billing():
    total_reported = 515.7 # Correct sum: 120.5 + 350 + 45.2 = 515.7
    # --- BUG 02: Cost Aggregation Error ---
    # Report a different total than the sum of items
    return jsonify({
        "totalCost": 890.0, # Intentional mismatch
        "currency": "USD",
        "bugId": "site058-bug02"
    })

@app.route('/api/tags/validate', methods=['POST'])
def validate_tags():
    # --- BUG 04: Region Mapping Inconsistency ---
    # Logic returns success even if region tag is wrong
    return jsonify({
        "valid": True,
        "message": "Region validation bypassed",
        "bugId": "site058-bug04"
    })

if __name__ == '__main__':
    app.run(port=9167, debug=True)
