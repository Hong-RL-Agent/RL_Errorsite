from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Mock Data
polls = [
    {
        "id": 1,
        "question": "올해 가장 기대되는 기술은?",
        "totalVotes": 150, # BUG 02 target: sum is 145
        "status": "active",
        "options": [
            {"id": 1, "text": "생성형 AI", "votes": 80},
            {"id": 2, "text": "양자 컴퓨팅", "votes": 40},
            {"id": 3, "text": "자율주행", "votes": 25}
        ]
    },
    {
        "id": 2,
        "question": "차세대 웹 프레임워크 선호도",
        "totalVotes": 50,
        "status": "closed", # BUG 04 target
        "options": [
            {"id": 1, "text": "React", "votes": 30},
            {"id": 2, "text": "Svelte", "votes": 20}
        ]
    }
]

logs = []

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"ok": True, "site": "site060", "status": "healthy", "engine": "python/flask"})

@app.route('/api/polls', methods=['GET'])
def get_polls():
    # --- BUG 02: vote-count-inconsistency ---
    # Poll #1 has totalVotes=150 but sum is 145
    return jsonify({
        "data": polls,
        "bugId": "site060-bug02"
    })

@app.route('/api/votes', methods=['POST'])
def cast_vote():
    data = request.json
    poll_id = data.get('pollId')
    option_id = data.get('optionId')
    user = data.get('user', 'Guest')

    poll = next((p for p in polls if p['id'] == poll_id), None)
    if not poll:
        return jsonify({"error": "Poll not found"}), 404

    # --- BUG 04: poll-closed-state-ignored ---
    # Should block if status == 'closed', but we let it pass
    is_closed_violation = poll['status'] == 'closed'

    # --- BUG 03: option-id-mapping-error ---
    # If option_id is 1, we increment option_id 2 instead
    target_option_id = option_id
    is_mapping_error = False
    if option_id == 1:
        target_option_id = 2
        is_mapping_error = True
    
    option = next((o for o in poll['options'] if o['id'] == target_option_id), None)
    if option:
        option['votes'] += 1
        poll['totalVotes'] += 1
    
    logs.append({"time": "now", "user": user, "poll": poll['question'], "option": option['text'] if option else "Unknown"})

    # --- BUG 01: duplicate-vote-acceptance ---
    # We don't check if user already voted
    
    bug_id = None
    if is_closed_violation: bug_id = "site060-bug04"
    elif is_mapping_error: bug_id = "site060-bug03"
    elif logs.count(user) > 0: bug_id = "site060-bug01" # Simulating multiple votes check

    return jsonify({
        "voted": True,
        "bugId": bug_id or "site060-bug01" # Default to bug01 for duplicate test trigger
    })

@app.route('/api/dashboard/summary', methods=['GET'])
def get_summary():
    return jsonify({
        "totalPolls": len(polls),
        "active": len([p for p in polls if p['status'] == 'active']),
        "closed": len([p for p in polls if p['status'] == 'closed'])
    })

@app.route('/api/votes/logs', methods=['GET'])
def get_logs():
    return jsonify({"data": logs})

if __name__ == '__main__':
    app.run(port=9169, debug=True)
