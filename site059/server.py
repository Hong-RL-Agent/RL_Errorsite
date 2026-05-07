from flask import Flask, jsonify, request
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

# Mock Data
rooms = [{"id": 1, "name": "글로벌 개발자 포럼"}, {"id": 2, "name": "인프라 보안팀"}]
messages = [
    {
        "id": 1, 
        "text": "서버 모니터링 시스템 업데이트 완료되었습니다.", 
        "timestamp": 1714700000, 
        "user": "System", 
        "readCount": 5,
        "attachment": None
    },
    {
        "id": 2, 
        "text": "리소스 사용량 분석 리포트 첨부합니다.", 
        "timestamp": 1714700500, 
        "user": "Admin", 
        "readCount": 3,
        "attachment": {"fileName": "report_v1.pdf", "size": "450KB", "type": "application/pdf"} # BUG 04 target
    },
    {
        "id": 3, 
        "text": "확인했습니다. 수고하셨습니다.", 
        "timestamp": 1714701000, 
        "user": "User_01", 
        "readCount": 2,
        "attachment": None
    }
]

logs = []

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"ok": True, "site": "site059", "status": "healthy", "engine": "python/flask"})

@app.route('/api/rooms', methods=['GET'])
def get_rooms():
    return jsonify({"data": rooms})

@app.route('/api/messages', methods=['GET'])
def get_messages():
    # --- BUG 01: message-order-inversion ---
    # Shuffle or intentionally put middle message at the end
    output = [messages[0], messages[2], messages[1]] 
    
    # --- BUG 04: attachment-metadata-mismatch ---
    # Metadata says 450KB, but let's assume it should have been 1.2MB
    
    return jsonify({
        "data": output,
        "bugId": "site059-bug01"
    })

@app.route('/api/messages', methods=['POST'])
def send_message():
    data = request.json
    text = data.get('text')
    
    # --- BUG 02: message-loss-on-send ---
    # We return success but DO NOT append to the messages list
    logs.append({"time": time.time(), "event": f"Message Sent: {text}", "status": "SUCCESS"})
    
    return jsonify({
        "sent": True,
        "bugId": "site059-bug02"
    })

@app.route('/api/messages/read', methods=['POST'])
def read_message():
    data = request.json
    msg_id = data.get('messageId')
    
    # --- BUG 03: read-count-desync ---
    # Should increment by 1, but we set it to a static wrong number or skip logic
    target = next((m for m in messages if m['id'] == msg_id), None)
    if target:
        target['readCount'] = 99 # Clearly desynced
    
    return jsonify({
        "updated": True,
        "bugId": "site059-bug03"
    })

@app.route('/api/dashboard/summary', methods=['GET'])
def get_summary():
    return jsonify({
        "totalMessages": len(messages),
        "rooms": len(rooms)
    })

@app.route('/api/messages/logs', methods=['GET'])
def get_logs():
    return jsonify({"data": logs})

if __name__ == '__main__':
    app.run(port=9168, debug=True)
