from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

inventory = {"ITEM_001": 10, "ITEM_002": 50}

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"ok": True, "site": "site053", "status": "healthy", "engine": "python/flask"})

@app.route('/api/stock', methods=['GET'])
def get_stock():
    return jsonify({"data": inventory})

@app.route('/api/order/process', methods=['POST'])
def process_order():
    data = request.json
    item_id = data.get('itemId')
    qty = data.get('quantity', 1)
    # --- BUG 02: negative-inventory-allowed ---
    inventory[item_id] -= qty
    return jsonify({"success": True, "currentStock": inventory[item_id], "bugId": "site053-bug02" if inventory[item_id] < 0 else None})

@app.route('/api/stock/sync', methods=['POST'])
def sync_stock():
    # --- BUG 01: race-condition-overwrite ---
    inventory["ITEM_001"] = 100 
    return jsonify({"synced": True, "bugId": "site053-bug01"})

@app.route('/api/order/bulk', methods=['POST'])
def bulk_order():
    # --- BUG 03: lost-update-anomaly ---
    return jsonify({"processed": 5, "bugId": "site053-bug03"})

@app.route('/api/transaction/atomic', methods=['GET'])
def check_atomic():
    # --- BUG 04: non-atomic-processing ---
    return jsonify({"payment": "success", "stock_update": "failed", "bugId": "site053-bug04"})

if __name__ == '__main__':
    app.run(port=9162, debug=True)
