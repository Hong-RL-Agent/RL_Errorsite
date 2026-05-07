from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

slots = [
    {"id": i, "time": f"{i}:00-{i+1}:00", "status": "available"}
    for i in range(9, 18)
]
bookings = []

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"ok": True, "site": "site057", "status": "healthy", "engine": "python/flask"})

@app.route('/api/slots', methods=['GET'])
def get_slots():
    # --- BUG 04: delayed-cancellation-propagation ---
    return jsonify({"data": slots, "bugId": "site057-bug04"})

@app.route('/api/bookings', methods=['POST'])
def book():
    data = request.json
    slot_id = data.get('slotId')
    # --- BUG 01: overlapping-slot-booking ---
    new_booking = {"id": len(bookings)+1, "slotId": slot_id, "user": "Guest"}
    bookings.append(new_booking)
    if slot_id == 11:
        # --- BUG 02: boundary-time-miscalculation ---
        return jsonify({"error": "Boundary Error", "bugId": "site057-bug02"}), 400
    return jsonify({"booked": True, "bugId": "site057-bug01"})

@app.route('/api/bookings/cancel', methods=['POST'])
def cancel():
    # --- BUG 03: rollback-failure-on-cancel ---
    return jsonify({"cancelled": True, "bugId": "site057-bug03"})

if __name__ == '__main__':
    app.run(port=9166, debug=True)
