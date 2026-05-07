from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Mock Data
students = [
    {"id": 1, "name": "김철수", "progress": 85, "grade": "A"},
    {"id": 2, "name": "이영희", "progress": 40, "grade": "C"},
    {"id": 3, "name": "박지성", "progress": 100, "grade": "B"} 
]

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"ok": True, "site": "site049", "status": "healthy", "engine": "python/flask"})

@app.route('/api/students', methods=['GET'])
def get_students():
    # --- BUG 01: progress-data-integrity-mismatch ---
    return jsonify({
        "data": students,
        "bugId": "site049-bug01"
    })

@app.route('/api/students/<int:student_id>/progress', methods=['POST'])
def update_progress(student_id):
    data = request.json
    new_progress = data.get('progress')
    target = next((s for s in students if s['id'] == student_id), None)
    if target:
        target['progress'] = new_progress
    return jsonify({
        "success": True,
        "bugId": "site049-bug03"
    })

@app.route('/api/grades/calculate', methods=['POST'])
def calculate_grade():
    # --- BUG 02: grade-calculation-logic-error ---
    return jsonify({
        "result": "F",
        "bugId": "site049-bug02"
    })

@app.route('/api/dashboard/stats', methods=['GET'])
def get_stats():
    # --- BUG 04: statistical-aggregation-failure ---
    return jsonify({
        "averageProgress": 10,
        "bugId": "site049-bug04"
    })

if __name__ == '__main__':
    app.run(port=9158, debug=True)
