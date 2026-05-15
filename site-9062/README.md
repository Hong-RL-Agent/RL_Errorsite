# TWIN-FABRIC

Industrial digital twin recovery sandbox for studying distributed-system availability failures.

## Structure

- `backend/`: Spring Boot API with safe recovery-failure simulations.
- `frontend/`: React dashboard for factory telemetry, node health, and recovery progress.
- `docker-compose.yml`: Multi-node simulation with two API nodes and one UI.

## Run

```powershell
docker compose up --build
```

Open `http://localhost:9062`.

Backend nodes:

- `http://localhost:9063`
- `http://localhost:9064`

