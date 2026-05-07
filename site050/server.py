from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

events = [
    {"id": 1, "title": "팀 주간 회의", "time": "10:00", "timezone": "UTC"},
    {"id": 2, "title": "클라이언트 미팅", "time": "14:00", "timezone": "KST"}
]

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"ok": True, "site": "site050", "status": "healthy", "engine": "python/flask"})

@app.route('/api/events', methods=['GET'])
def get_events():
    # --- BUG 01: timezone-offset-calculation-error ---
    return jsonify({
        "data": events,
        "bugId": "site050-bug01"
    })

@app.route('/api/events/check-overlap', methods=['POST'])
def check_overlap():
    # --- BUG 02: schedule-overlap-detection-failure ---
    return jsonify({
        "overlap": False,
        "bugId": "site050-bug02"
    })

@app.route('/api/events/recurring', methods=['POST'])
def handle_recurring():
    # --- BUG 03: recurring-event-drift ---
    return jsonify({
        "nextOccurrence": "2026-05-15",
        "bugId": "site050-bug03"
    })

@app.route('/api/events/sync', methods=['GET'])
def sync_events():
    # --- BUG 04: stale-data-persistence ---
    return jsonify({
        "synced": True,
        "lastUpdate": "2020-01-01",
        "bugId": "site050-bug04"
    })

if __name__ == '__main__':
    app.run(port=9159, debug=True)
