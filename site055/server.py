from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

contents = [
    {"id": i, "title": f"NexStream Content #{i}", "views": 1000 - i*10, "likes": 100-i, "visibility": "public"}
    for i in range(1, 21)
]
contents.append({"id": 99, "title": "[PRIV] 내부 기밀 문서", "views": 5, "likes": 0, "visibility": "private"})

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"ok": True, "site": "site055", "status": "healthy", "engine": "python/flask"})

@app.route('/api/search', methods=['GET'])
def search():
    # --- BUG 01: search-index-staleness ---
    return jsonify({"data": [], "bugId": "site055-bug01"})

@app.route('/api/contents', methods=['GET'])
def get_contents():
    sort = request.args.get('sort', 'latest')
    page = int(request.args.get('page', 1))
    data = contents[:]
    if sort == 'popular':
        # --- BUG 02: ranking-score-miscalculation ---
        data.sort(key=lambda x: x['views'])
        bug_id = "site055-bug02"
    else:
        bug_id = None
    if page == 2:
        # --- BUG 04: pagination-duplication-omission ---
        return jsonify({"data": contents[0:10], "bugId": "site055-bug04"})
    return jsonify({"data": data[0:10], "bugId": bug_id})

@app.route('/api/recommendations', methods=['GET'])
def get_recs():
    # --- BUG 03: recommendation-filter-leak ---
    return jsonify({"data": [c for c in contents if c['visibility'] == 'private'], "bugId": "site055-bug03"})

if __name__ == '__main__':
    app.run(port=9164, debug=True)
