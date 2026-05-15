# CLIMATE-AI Regression Report

Project: CLIMATE-AI climate change prediction and infrastructure observability server  
Public endpoint: http://localhost:9072  
Backend API surface: `/api/health`, `/api/dashboard`  
Frontend API policy: relative `/api/...` calls only

## Port And Isolation Controls

- Docker Compose exposes only `9072:80` for the public application.
- Frontend Nginx proxies `/api/` to the isolated backend service `climate-ai-backend:8080`.
- Vite development server is fixed to `http://localhost:9072` with `strictPort: true`.
- Vite development proxy forwards `/api` to `http://localhost:8080`.
- Spring Boot CORS allows `http://localhost:9072` and `http://127.0.0.1:9072`.

## Implemented Regression Scenarios

1. Data drift alert sink disabled
   - Logic: `/api/dashboard` emits `driftScore` above the warning range while the drift log event has `forwarded=false`.
   - PPO signal: `drift_score_high_without_page`.
   - Expected learning: identify alert paths that fail open during climate model drift.

2. Specific error log omission and incomplete logging
   - Logic: selected `ERROR` or `WARN` events are marked as not forwarded, and `lostLogEvents` increases in the summary.
   - PPO signal: `missing_forwarded_error_events`.
   - Expected learning: penalize missing telemetry under incident conditions.

3. Autoscaling slower than traffic growth
   - Logic: `trafficRps` is high, `desiredReplicas` exceeds `actualReplicas`, and `scaleLagSeconds` remains elevated.
   - PPO signal: `replica_gap_with_rps_surge`.
   - Expected learning: correlate delayed scaling with saturation risk.

4. Scale up/down command failure at resource threshold
   - Logic: `commandFailure=true` while node CPU and queue utilization are near saturation.
   - PPO signal: `threshold_reached_command_failed`.
   - Expected learning: detect failed control-plane commands near resource ceilings.

5. Abnormal traffic surge reproduction
   - Logic: traffic gateway log reports a surge window and the autoscaling state exposes elevated RPS.
   - PPO signal: `surge_window_rps_spike`.
   - Expected learning: identify nonlinear demand growth before SLO burn accelerates.

6. Burst queue exhaustion and request rejection
   - Logic: a node enters `queue_exhausted`, queue depth exceeds 0.9, and `rejectedRequests` rises.
   - PPO signal: `queue_depth_near_one_rejections`.
   - Expected learning: reduce request rejection under burst traffic.

7. Central log collector communication failure
   - Logic: `log_collector_down` node status appears and some logs have `forwarded=false`.
   - PPO signal: `forwarded_false_lost_events`.
   - Expected learning: treat telemetry transport failure as data loss risk.

8. Distributed cache synchronization lag and consistency issue
   - Logic: `cacheLagMs` is emitted per node, with one node above 12 seconds and status `stale_cache`.
   - PPO signal: `cache_lag_ms_high`.
   - Expected learning: detect stale regional climate inference data.

9. External API timeout missing and thread hang risk
   - Logic: external API logs describe retry attempts without timeout metadata.
   - PPO signal: `thread_hang_risk`.
   - Expected learning: avoid unbounded waits on upstream climate feeds.

10. Retry storm without exponential backoff
    - Logic: system logs include retries without backoff or jitter metadata.
    - PPO signal: `retry_without_jitter`.
    - Expected learning: suppress retry amplification during upstream faults.

11. Graceful shutdown failure
    - Logic: shutdown hook log reports immediate interruption of active jobs after SIGTERM.
    - PPO signal: `jobs_interrupted_on_sigterm`.
    - Expected learning: require drain windows before process termination.

## Dashboard Coverage

- Global temperature anomaly heatmap: SVG grid with anomaly intensity and risk coloring.
- Carbon emission trend chart: multi-line SVG chart for Power, Transport, and Industry.
- Autoscaling and server node indicators: desired/actual/pending replicas, node CPU, queue depth, cache lag, and degraded statuses.
- Real-time system log terminal: timestamped log stream with forwarded/lost telemetry state.
- Regression matrix: the 11 anti-patterns are exposed as machine-readable scenario objects and visible operator cards.

## Verification Notes

- API base is relative in frontend code: `fetch("/api/dashboard")`.
- No previous project port references are used.
- Compose network name and container names are scoped with `9072`.

