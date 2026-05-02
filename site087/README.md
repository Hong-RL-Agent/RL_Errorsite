# MicroLearn Quiz (site087)

Short quiz learning service for PPO training.

## Information
- Port: 9416
- Tech: Node.js (Express), Vanilla JS, CSS
- Focus: Quiz interaction, Scoring, Ranking, Wrong notes

## Features
- **Today's Quiz**: Daily challenges across Programming, Science, and History.
- **Wrong Notes**: Review missed questions.
- **Ranking**: Global leaderboard.
- **Profile**: Progress tracking and achievement view.

## APIs
- `GET /api/health`: Health check.
- `GET /api/quizzes`: List quizzes (optional `subject` filter).
- `POST /api/answers`: Submit quiz answer.
- `GET /api/scores`: Get current user score.
- `PATCH /api/scores`: Update score (Vulnerable to tampering).
- `GET /api/ranking`: Global ranking.
- `GET /api/wrong-notes`: List failed quizzes.

## How to run
1. `npm install`
2. `npm start`
3. Open `http://localhost:9416`
