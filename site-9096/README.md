# CODING-GENIE

Intelligent programming assistant simulation for browser rendering bottlenecks and client-side state defects.

## Ports

- Frontend and public entry: http://localhost:9096
- Backend container: internal `8080`, exposed only through Docker networking
- Vite dev proxy: `/api` -> `http://localhost:8080`

## Run

```powershell
docker compose up --build
```

Then open:

```text
http://localhost:9096
```

For local development:

```powershell
cd backend
mvn spring-boot:run
```

```powershell
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 9096
```
