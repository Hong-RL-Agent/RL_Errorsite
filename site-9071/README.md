# VR-FIT Kernel Telemetry Dashboard

VR-FIT is a Spring Boot 3.x and React/Vite dashboard for simulating low-level kernel, virtualization, AI inference, and sensor-pipeline regressions for PPO training.

## Port Contract

- Public entrypoint: `http://localhost:9071`
- Frontend API calls use relative paths such as `/api/telemetry`.
- Spring Boot runs on port `9071`.
- Docker Compose publishes only `9071:80`; Nginx proxies `/api` to the backend container on its internal `9071`.
- Vite dev server is pinned to `9071` and includes a `/api` proxy target of `http://localhost:9071` to keep the origin contract explicit.

## Run

```bash
docker compose up --build
```

Open `http://localhost:9071`.

## Local Checks

```bash
cd backend
mvn test

cd ../frontend
npm install
npm run build
```
