# ROBO-LAB

ROBO-LAB is an isolated robotics operations simulation platform for PPO agents learning hardware bottlenecks and dark-pattern UI defects.

## Port Contract

- Runtime URL: `http://localhost:9070`
- Spring Boot API: `http://localhost:9070/api/...`
- Frontend API calls: relative `/api/...`
- Vite development proxy: `/api -> http://localhost:9070`
- Docker Compose mapping: `9070:9070`

No project ports from previous environments are referenced.

## Run

```bash
docker compose up --build
```

Then open:

```text
http://localhost:9070
```

For local development, run the Spring Boot backend on `9070`, then run Vite from `frontend/`. The Vite server proxies `/api` to `http://localhost:9070`.
