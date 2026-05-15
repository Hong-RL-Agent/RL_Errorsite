# Fault Model

The simulator exposes eleven controlled regressions through
`DeepSeaControlService`. Faults are represented as telemetry, delay, queueing,
allocation pressure, and task starvation. The service avoids privileged host
operations and does not require unsafe kernel settings.

## Docker Constraints

- `cpus: 1.25` and `cpu_shares: 256` make CFS quota pressure observable.
- `docker-compose.io-limits.yml` can restrict read/write throughput on Linux
  hosts that expose compatible cgroup block I/O controllers.
- `mem_limit: 768m` makes dirty buffering and allocation pressure visible.
- Backend port is `9057`; frontend port is `9056`.

Some block I/O limits depend on Docker engine, cgroup mode, and the listed
device path. If unsupported, use the base `docker-compose.yml`; the backend
still reports simulated queue depth and throttling events.
