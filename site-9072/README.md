# CLIMATE-AI Infrastructure Observability Lab

CLIMATE-AI is a port-isolated climate prediction and infrastructure control dashboard for SRE regression training.

## Ports

- Public app: http://localhost:9072
- Frontend dev server: http://localhost:9072
- Backend internal container port: 8080
- Frontend API calls: relative `/api/...`

## Local Development

Backend:

```powershell
cd backend
$env:SERVER_PORT='8080'; gradle bootRun
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Docker:

```powershell
docker compose up --build
```
