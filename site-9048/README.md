# LEX-AI Performance Lab

High-load AI legal consultation simulation for infrastructure monitoring research.

## Structure

- `backend/` - Spring Boot 3.x + Maven API with 11 simulated OS, hardware, IO, memory, CPU, and GPU bottlenecks.
- `frontend/` - React + Vite + Tailwind v4 enterprise dashboard.
- `docker-compose.yml` - CPU and memory constraints for repeatable lab behavior.

## Run Locally

Backend:

```bash
cd backend
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Docker:

```bash
docker compose up --build
```

Frontend runs on port `9048`; backend API runs on port `8080`.

## Simulation Map

1. GPU context switching: `/api/inference` adds 200 ms when switching Criminal/Civil models.
2. CPU quota throttling: `legal-analysis` service is limited to `0.10` CPU in Compose.
3. VM memory ballooning jitter: background allocator randomly allocates/releases byte arrays.
4. Ghost file occupation: log clear deletes an open file while retaining the Java file descriptor.
5. Huge page compaction delay: document indexing does large array copies and a 1 s stutter.
6. SSD Trim I/O freeze: every 10th DB write sleeps 3 s.
7. Cloud steal time: request interceptor injects random 50-500 ms delay and reports it.
8. User-space fragmentation: custom cache stores payloads in many small byte chunks.
9. GPU thermal throttling: compute gauge drops to 30% and inference may timeout.
10. Interrupt coalescence delay: endpoint waits for batches of 5 requests before responding.
11. CPU C-state wake-up latency: request interceptor adds 10 ms at request start.
