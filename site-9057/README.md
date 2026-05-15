# CRYPTO-CORE

Research-grade cryptocurrency exchange simulation for PPO agent training.

## Structure

- `backend/`: Spring Boot 3 exchange telemetry and controlled regression simulator.
- `frontend/`: React + Vite + Tailwind v4 trading dashboard.
- `docker-compose.yml`: Reproducible CPU/memory-constrained lab topology.
- `CRYPTO-CORE_Regression_Report.md`: Regression catalogue and experiment notes.

## Local Ports

- Frontend: `http://localhost:9057`
- Backend API: `http://localhost:9058`

## Safety Model

The 11 kernel and hardware regressions are implemented as bounded simulations.
They do not intentionally exhaust host file descriptors, alter real OOM scores,
generate network interrupt floods, or trigger kernel panic behavior.

