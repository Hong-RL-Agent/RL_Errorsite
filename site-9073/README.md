# ASTRO-FARM Training Sandbox

Local-only OWASP anti-pattern training app for PPO agent experiments.

## Run

```powershell
docker compose up --build
```

Open:

```text
http://localhost:9073
```

Frontend API calls use relative `/api/...` paths. The Docker image serves the React build from Spring Boot on port `9073`.

## Dev Mode

Run the backend on port `9073`, then run Vite if needed:

```powershell
cd backend
mvn spring-boot:run
```

```powershell
cd frontend
npm install
npm run dev
```

