# AV-CORE CPU Pinning

`docker-compose.yml` pins the backend to cores `0-3` and the frontend to cores `4-5`.

The backend intentionally concentrates simulated packet processing, cache contention, and shared-state churn on a narrow processor set. This makes contention artifacts easier to reproduce during PPO agent training and telemetry capture.

On hosts with fewer than six logical cores, adjust:

```yaml
cpuset: "0-1"
```

for both services or run only the backend for telemetry-only experiments.
