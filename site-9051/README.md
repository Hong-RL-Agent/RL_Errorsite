# SKY-LOGISTICS Drone Fleet Management Lab

Research dashboard and simulation harness for observing virtualization, container, memory, GPU, I/O, and high-concurrency regression patterns.

## Project Structure

```text
.
├── backend/                 # Spring Boot 3.x API and regression simulator
├── frontend/                # React + Vite + Tailwind v4 command center
├── docker-compose.yml       # Lab runtime with memory and PID limits
└── README.md
```

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

Docker Compose:

```bash
docker compose up --build
```

The Docker frontend is published at `http://localhost:9050` and proxies `/api` to the backend on port `9051`. During Vite development, run the frontend on `http://localhost:9050`.

## Regression Scenarios

The backend exposes a bounded simulation of the 11 systemic regressions through `SystemStressService`.

- `interrupt-storm`: sensor overflow and CPU steal spike telemetry
- `kernel-lockup`: route calculation holding a simulated spinlock
- `cache-bloat`: dirty map tile cache growth under cgroup pressure
- `numa-paradox`: regional data access with synthetic 100ms NUMA latency
- `pid-limit`: fleet scaling failure once thread/process budget is exhausted
- `journal-delay`: high-frequency flight log writer with 2s journal stall
- `gpu-launch-delay`: obstacle avoidance dispatch delayed by 150ms
- `pcie-p2p`: non-optimal GPU peer topology and slow render telemetry
- `bandwidth-saturation`: streaming memory-copy workers slowing command logic
- `compaction-storm`: high-order video buffer allocation and jitter
- `thundering-herd`: 50 delivery workers released into one mutex

These are lab simulations designed to make symptoms visible in UI and logs without requiring privileged kernel modules.
