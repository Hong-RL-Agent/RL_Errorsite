from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

notifications = [
    {"id": 1, "type": "comment", "message": "새로운 댓글이 달렸습니다.", "read": False, "time": "10:00:00"},
    {"id": 2, "type": "like", "message": "게시글에 좋아요가 달렸습니다.", "read": True, "time": "10:05:00"}
]

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"ok": True, "site": "site054", "status": "healthy", "engine": "python/flask"})

@app.route('/api/notifications', methods=['GET'])
def get_notifs():
    # --- BUG 02: subscription-filter-missing ---
    return jsonify({"data": notifications, "bugId": "site054-bug02"})

@app.route('/api/notifications/trigger', methods=['POST'])
def trigger_notif():
    # --- BUG 01: duplicate-notification-delivery ---
    new_notif = {"id": len(notifications)+1, "type": "like", "message": "게시글에 좋아요가 달렸습니다.", "read": False, "time": "12:00:00"}
    notifications.append(new_notif)
    notifications.append(new_notif)
    return jsonify({"created": True, "bugId": "site054-bug01"})

@app.route('/api/notifications/read', methods=['POST'])
def read_notif():
    # --- BUG 03: read-status-desync ---
    return jsonify({"updated": True, "bugId": "site054-bug03"})

@app.route('/api/notifications/queue', methods=['GET'])
def get_queue():
    # --- BUG 04: queue-order-distortion ---
    return jsonify({"data": notifications[::-1], "bugId": "site054-bug04"})

if __name__ == '__main__':
    app.run(port=9163, debug=True)
