# VR-FIT Regression Report

Target service: `http://localhost:9071`

This report documents the 11 intentional anti-pattern simulations exposed by the VR-FIT telemetry API and visualized in the management dashboard. These are controlled fault models for PPO agent training and operator regression drills.

| # | Scenario Code | Fault Model | PPO Signal | Dashboard Surface |
|---|---|---|---|---|
| 1 | `OOM_RENDER_KILL` | OOM killer selects the core render process because memory pressure scoring ignores VR rendering priority. | `termination_penalty` | Kernel risk matrix, memory pressure, motion-sync degradation |
| 2 | `KERNEL_HARD_LOCKUP` | Kernel hard lockup freezes the scheduler and delays the motion feedback loop. | `freeze_latency_spike` | Scheduler delay, pose latency, critical scenario row |
| 3 | `ZOMBIE_SESSION_LEAK` | Closed session GPU buffers and sensor queues remain allocated as zombie resources. | `leak_accumulation` | Zombie memory readout and scenario risk |
| 4 | `NO_WARMUP_RECOVERY` | Recovered server accepts traffic without model cache, JIT, or render-pipeline warmup. | `cold_start_cost` | AI queue depth, cold latency, recovery degradation |
| 5 | `QUOTA_GATE_BLOCK` | Infrastructure quota exhaustion blocks new VR athletes at admission control. | `admission_rejection` | Quota blocked sessions and admission risk |
| 6 | `SILENT_CB_EMPTY` | Circuit breaker returns empty pose results instead of surfacing an error. | `false_success` | Circuit breaker fallback metric and scenario matrix |
| 7 | `THREADLOCAL_BLEED` | ThreadLocal context leaks across reused request threads, mixing user identity state. | `privacy_cross_talk` | Thread-local bleed risk and runtime/security row |
| 8 | `TZ_RECORD_DRIFT` | KST edge services and UTC core services disagree on workout timestamps. | `temporal_inconsistency` | Timezone drift readout |
| 9 | `VMEXIT_STORM` | Virtualization generates excessive VM exits, reducing SIMD pose-math throughput. | `compute_steal` | VM exit rate, CPU steal, virtualization scenario |
| 10 | `POSE_LATENCY_OVER` | AI pose inference latency exceeds the real-time movement budget. | `control_lag` | Pose latency stat, AI dashboard, skeleton confidence |
| 11 | `SENSOR_PIPELINE_DROP` | Sensor ingestion bottleneck drops motion samples under backpressure. | `observation_loss` | Sensor throughput and dropped frame indicators |

## API Coverage

- `GET /api/telemetry` returns the complete dashboard snapshot, including fitness telemetry, kernel telemetry, AI telemetry, skeleton joints, time-series streams, and all scenario states.
- `GET /api/scenarios` returns the standalone 11-scenario regression matrix.

## Isolation Notes

- No legacy project ports are used.
- Browser-origin traffic is anchored to `http://localhost:9071`.
- Frontend API calls are relative `/api/...` requests, so they follow the active 9071 origin automatically.
- Spring Boot global CORS allows `http://localhost:9071`.
- Docker Compose exposes a single public port mapping: `9071:80`.
