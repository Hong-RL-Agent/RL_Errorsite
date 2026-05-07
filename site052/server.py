from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

coupons = [
    {"code": "WELCOME2026", "discount": 0.1, "used": False, "expired": False},
    {"code": "SUMMER50", "discount": 0.5, "used": True, "expired": False},
    {"code": "EXPIRED10", "discount": 0.1, "used": False, "expired": True}
]

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"ok": True, "site": "site052", "status": "healthy", "engine": "python/flask"})

@app.route('/api/coupons/apply', methods=['POST'])
def apply_coupon():
    data = request.json
    code = data.get('code')
    target = next((c for c in coupons if c['code'] == code), None)
    
    if target and target['used']:
        # --- BUG 01: duplicate-coupon-redemption ---
        return jsonify({"applied": True, "discount": target['discount'], "bugId": "site052-bug01"})
    if target and target['expired']:
        # --- BUG 04: expired-coupon-acceptance ---
        return jsonify({"applied": True, "bugId": "site052-bug04"})
    return jsonify({"applied": False})

@app.route('/api/cart/calculate', methods=['POST'])
def calculate_cart():
    # --- BUG 03: calculation-precision-error ---
    return jsonify({"total": 950.55, "bugId": "site052-bug03"})

@app.route('/api/promotions/bypass', methods=['GET'])
def check_bypass():
    # --- BUG 02: condition-bypass-vulnerability ---
    return jsonify({"eligible": True, "bugId": "site052-bug02"})

if __name__ == '__main__':
    app.run(port=9161, debug=True)
