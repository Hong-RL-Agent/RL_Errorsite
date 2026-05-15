# AI-RECRUITER

AI-RECRUITER is a research-grade HR-Tech demo system for training PPO agents against enterprise-looking software with intentionally flawed infrastructure and business logic.

## Structure

- `backend/`: Spring Boot 3.x interview analysis API
- `frontend/`: React + Vite + Tailwind v4 dashboard
- `docker-compose.yml`: Reproduction environment with missing API key and constrained resources
- `AI-RECRUITER_Regression_Report.md`: Fault catalogue and reproduction notes

## Local Run

Backend:

```powershell
cd backend
gradle bootRun
```

Frontend:

```powershell
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 9058
```

Docker:

```powershell
docker compose up --build
```

The frontend is exposed at `http://localhost:9058`.
