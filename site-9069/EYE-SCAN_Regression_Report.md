# EYE-SCAN Regression Report

## Scope

- Service identity: EYE-SCAN intelligent CCTV control server
- Fixed browser origin: `http://localhost:9069`
- Frontend API contract: relative `/api/...` calls only
- Backend API base path: `/api`
- Docker exposure: host `9069` mapped to frontend Nginx, which proxies `/api` to the Spring Boot service on container port `9069`

## Port And CORS Controls

- Spring Boot runs with `SERVER_PORT=9069`.
- Global CORS is defined in `backend/src/main/java/com/eyescan/config/CorsConfig.java`.
- Allowed origin defaults to `http://localhost:9069`.
- Vite defines a `/api` proxy in `frontend/vite.config.ts`.
- React uses `fetch('/api/telemetry')`; no frontend absolute API URL is used.

## Implemented Simulation Antipatterns

| # | Scenario | Backend Code | PPO Learning Signal |
|---|---|---|---|
| 1 | 로그 로테이션 시 발생하는 동기적 I/O 블로킹 및 렌더링 지연 | `SYNC_LOG_IO` | I/O wait, frame delay, FPS degradation correlation |
| 2 | 클라우드 AZ 간 복제 지연으로 인한 페일오버 시 데이터 소실 | `AZ_REPLICATION_EVAP` | RPO breach and recovery reward shaping |
| 3 | Web Worker와 Service Worker 간의 자원 점유 락 드리프트 | `WORKER_LOCK_DRIFT` | Lock hold time, contention, deadlock precursors |
| 4 | 클라우드 IMDS 버전(v1/v2) 불일치 인증 권한 오류 | `IMDS_VERSION_MISMATCH` | Metadata token mismatch and retry amplification |
| 5 | 지능형 스로틀링에 의한 불규칙한 네트워크 지연 | `SMART_THROTTLE_DRIFT` | Latency variance, queue length, budget pressure |
| 6 | 분산 서버 간 클록 스큐로 인한 이벤트 기록 순서 역전 | `CLOCK_SKEW_REVERSAL` | Logical clock correction and event ordering |
| 7 | 로그 수집기 버퍼 오버플로우로 인한 관측성 오류 | `LOG_COLLECTOR_OVERFLOW` | Sampling loss, dashboard trust decay |
| 8 | API 게이트웨이 헤더 변환 오류로 인한 인증 세션 유실 | `GATEWAY_HEADER_MUTATION` | Header integrity and auth session continuity |
| 9 | 서버리스 콜드 스타트 초기화 시간 요동 | `LAMBDA_COLD_JITTER` | Cold-start variance mitigation |
| 10 | 서버리스 컨테이너 재사용 글로벌 상태 오염 | `SERVERLESS_GLOBAL_LEAK` | Tenant isolation and state contamination detection |
| 11 | 스팟 인스턴스 회수 시 비정상 종료 및 상태 유실 | `SPOT_INTERRUPTION_LOSS` | Checkpoint cadence and interruption handling |

## UI Coverage

- 4분할 CCTV 피드 시뮬레이션: CSS/SVG radar sweep, thermal glow, scan noise, target pulse
- AZ 상태 인디케이터: replication lag and packet loss meters
- Clock Skew 시각화: AZ별 skew bar and ordering risk label
- Cloud throttling gauge: CPU, network, API budget, synthetic latency
- Fault catalog: all 11 scenarios rendered from backend telemetry

## Regression Checks

- `rg "906[2-8]"` should return no legacy port references.
- `rg "http://localhost:(?!9069)"` should return no non-9069 localhost references when regex lookahead is available.
- `rg "fetch\\(" frontend/src` should show relative `/api/...` calls.
- `docker compose up --build` should expose the completed control room at `http://localhost:9069`.

