# SPACE-MINING Performance Report

기준 주소: `http://localhost:9094`

이 프로젝트는 PPO 에이전트가 서버 성능 병목과 자원 고갈 결함을 학습할 수 있도록 11개 취약 패턴을 의도적으로 포함한다. 모든 결함은 `POST /api/faults/{type}` 형식으로 호출된다.

| # | 결함 | 엔드포인트 | 구현 위치 | 관측 신호 |
|---|---|---|---|---|
| 1 | DB 커넥션 반환 누락 | `/api/faults/connection-leak` | `PerformanceFaultLab.connectionLeak()` | Hikari active 증가, connection timeout |
| 2 | Thread Pool Rejection | `/api/faults/thread-rejection` | `MiningExecutorConfig`, `threadRejection()` | rejected count 증가, 작업 손실 |
| 3 | 동기 I/O 블로킹 | `/api/faults/blocking-io` | `blockingIo()` | 요청 스레드 대기, latency 증가 |
| 4 | CPU 100% 점유 | `/api/faults/cpu-saturation` | `cpuSaturation()` | CPU spike, 응답 지연 |
| 5 | 정적 컬렉션 메모리 누수 | `/api/faults/memory-leak` | static `LEAKED_TELEMETRY_FRAMES` | heap 사용량 증가, GC pressure |
| 6 | 로그 무한 증식 | `/api/faults/log-growth` | `logGrowth()` | `logs/space-mining-operations.log` 급증 |
| 7 | 데드락 | `/api/faults/deadlock` | `deadlockScenario()` | BLOCKED thread, 작업 정지 |
| 8 | 레이스 컨디션 | `/api/faults/race-condition` | `unsafeLedgerCounter++` | ledger counter 불일치 |
| 9 | 캐시 스탬피드 | `/api/faults/cache-stampede` | naive cache miss 처리 | DB read 동시 폭증 |
| 10 | N+1 쿼리 | `/api/faults/n-plus-one` | lazy asteroid 접근 | transaction row 수만큼 추가 select |
| 11 | 장기 트랜잭션 | `/api/faults/long-transaction` | `@Transactional` 내부 sleep | connection/lock 장시간 점유 |

## 네트워크 격리

- 외부 접속 포트는 `9094:9094` 하나만 노출한다.
- Spring Boot 서버 포트는 `9094`로 고정한다.
- React는 API 호출에 절대 URL을 쓰지 않고 `/api/dashboard`, `/api/faults/{type}` 상대 경로만 사용한다.
- Docker 배포에서는 Nginx가 `http://backend:9094/api/`로 내부 프록시한다.
- Vite 개발 서버도 `/api` 프록시 항목을 포함한다.

## PPO 학습 포인트

- pool exhaustion, rejection, blocking, CPU saturation, heap retention, disk pressure, deadlock, race, stampede, N+1, long transaction을 각기 독립적인 action으로 유발할 수 있다.
- 대시보드의 telemetry, logs, fault injection result를 상태 관측값으로 사용할 수 있다.
- 장애 강도는 `application.yml`의 Hikari pool size, executor queue size, fault loop count로 조절 가능하다.
