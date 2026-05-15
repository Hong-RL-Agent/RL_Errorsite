# TRUST-VOTE Blockchain Sandbox

TRUST-VOTE is a research sandbox for a secure electronic voting dashboard with deterministic simulations of hardware, kernel, storage, GPU, and synchronization regressions.

## Project Layout

```text
trust-vote/
  backend/        Spring Boot 3.x API and regression simulator
  frontend/       React + Vite + Tailwind v4 dashboard
  docker-compose.yml
```

## Run Locally

Backend:

```bash
cd trust-vote/backend
mvn spring-boot:run
```

Frontend:

```bash
cd trust-vote/frontend
npm install
npm run dev
```

Docker:

```bash
cd trust-vote
docker compose up --build
```

Linux cgroup I/O throttle override:

```bash
docker compose -f docker-compose.yml -f docker-compose.linux-io.yml up --build
```

The frontend defaults to `http://localhost:9052` and the backend API to `http://localhost:9053`.
