# DEEP-SEA CORE

DEEP-SEA CORE is a simulated abyssal base control server for research workloads.
It combines a Spring Boot 3 backend fault simulator with a React/Vite/Tailwind v4
operator console.

## Structure

```text
.
├── backend/                 Spring Boot 3.x control and telemetry service
├── frontend/                React + Vite + Tailwind v4 abyssal command UI
├── docker-compose.yml       CPU, I/O and container limits for fault simulation
└── ops/                     Runtime notes and host tuning references
```

## Run

```bash
docker compose up --build
```

Frontend: http://localhost:9056

Backend API: http://localhost:9057/api/core/status

On Linux hosts that support Docker block I/O throttling for the target device:

```bash
docker compose -f docker-compose.yml -f docker-compose.io-limits.yml up --build
```

The backend intentionally simulates hardware and virtualization bottlenecks.
It is designed for research and training observability agents, not for production
control of real equipment.
