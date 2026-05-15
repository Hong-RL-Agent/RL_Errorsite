# WEATHER-SIM Final Report

## Port Isolation

- User-facing origin: `http://localhost:9099`
- Frontend API calls use relative paths such as `/api/overview`.
- Docker Compose exposes only the frontend gateway on host port `9099`.
- Nginx and Vite proxy `/api` requests to the Spring Boot API.
- Spring Boot has global CORS rules for `http://localhost:9099`.

## Simulated Infrastructure and Database Fault Patterns

1. **Pod OOMKilled**: `polar-vortex-assimilation` exceeds its memory limit and restarts. PPO signal: restart count, memory pressure, cold-start latency.
2. **PV Mount Error**: `radar-archive-pv` fails to attach because the storage endpoint times out. PPO signal: pending pods, mount failure events, missing archive reads.
3. **Cloud Region Outage**: `ap-northeast-2` enters a region-wide interruption state. PPO signal: region availability, cross-region failover latency, error budget burn.
4. **ELK Pipeline Collapse**: log schema changes from `severity` to `level`, breaking downstream parsing. PPO signal: ingestion drop, parse failures, missing log fields.
5. **Corrupted Backup Script**: backup checksum verification fails and restore is blocked. PPO signal: failed checksum, stale recovery point objective, restore dry-run failure.
6. **IAM Lockout**: misconfigured policy removes control-plane privileges from the weather operator role. PPO signal: access denied rate, failed remediation actions, policy drift.
7. **Disk I/O Credit Exhaustion**: burst credits for cloud disks are depleted during radar tile reindexing. PPO signal: disk queue depth, throttled IOPS, increased write latency.
8. **Monitoring Agent Overhead**: telemetry sidecar consumes excessive CPU and slows application threads. PPO signal: agent CPU share, p95 latency, scheduling delay.
9. **Missing Index Full Table Scan**: `weather_observations(station_id, observed_at)` index is absent. PPO signal: scanned rows, query latency, DB CPU saturation.
10. **Low Isolation Transaction Drift**: weather updates are written with weak isolation and produce inconsistent forecast snapshots. PPO signal: non-repeatable reads, drifted version counters, anomaly count.
11. **Replication Lag**: replica trails the primary by hundreds of seconds during storm-cell ingestion. PPO signal: lag seconds, stale read percentage, replica apply queue depth.

## PPO Training Use

The backend emits deterministic fault metadata and fluctuating telemetry values. A PPO agent can learn policies that prioritize remediation by severity, blast radius, user impact, and database recovery risk.

## Key Files

- `backend/src/main/java/org/wmo/weathersim/WeatherSimApplication.java`
- `backend/src/main/java/org/wmo/weathersim/config/WebConfig.java`
- `backend/src/main/java/org/wmo/weathersim/controller/WeatherOpsController.java`
- `frontend/src/App.jsx`
- `frontend/src/index.css`
- `frontend/vite.config.js`
- `frontend/nginx.conf`
- `docker-compose.yml`

