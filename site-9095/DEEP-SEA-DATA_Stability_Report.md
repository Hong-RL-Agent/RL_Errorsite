# DEEP-SEA-DATA Stability Report

기준 서비스 주소: `http://localhost:9095`

이 문서는 PPO 에이전트가 대규모 분산 환경의 가용성 병목과 연쇄 장애를 학습할 수 있도록, DEEP-SEA-DATA 관제 서버에 포함된 11개 취약 패턴을 정리한다. 각 패턴은 백엔드 텔레메트리(`GET /api/dashboard`, `GET /api/fault-patterns`)와 프론트엔드 관제 UI에 노출된다.

## 1. 서킷 브레이커 오작동

- 패턴: 장애 상황에서도 breaker가 열리지 않고 downstream 호출이 계속된다.
- 시뮬레이션 신호: `circuit-breaker` 로그, `Circuit breaker stuck closed` 결함 카드.
- 학습 목표: 5xx burst, fallback 미동작, breaker 상태 전이를 함께 관찰한다.
- 개선 방향: failure rate threshold, sliding window, half-open probe, fallback budget을 명시한다.

## 2. 비동기 큐/토픽 정체

- 패턴: producer 처리량이 consumer 처리량을 지속적으로 초과한다.
- 시뮬레이션 신호: Kafka `cable.telemetry.raw` lag 180k 이상, RabbitMQ 알림 큐 backlog.
- 학습 목표: lag 증가 속도와 drain window 초과를 병목 신호로 학습한다.
- 개선 방향: consumer autoscaling, partition 재조정, backpressure, DLQ 정책을 적용한다.

## 3. Swapping Death

- 패턴: 메모리 부족으로 major page fault가 늘고 디스크 swap이 요청 경로 latency를 오염시킨다.
- 시뮬레이션 신호: `swap-monitor` 로그와 thermal/power 이상 진동.
- 학습 목표: CPU가 낮아도 latency가 폭증하는 메모리 압박 케이스를 식별한다.
- 개선 방향: container memory limit, heap sizing, OOM policy, swap 사용 제한을 명확히 한다.

## 4. Retry Storm

- 패턴: 일시적 순단 후 backoff 없이 즉시 재요청을 보낸다.
- 시뮬레이션 신호: `retry-gateway` 로그, packet loss가 높은 cable route.
- 학습 목표: 짧은 packet loss가 전체 API 부하로 증폭되는 경로를 추론한다.
- 개선 방향: exponential backoff, jitter, retry budget, idempotency key를 적용한다.

## 5. Timeout 누락

- 패턴: 응답 없는 원격 호출이 deadline 없이 스레드를 점유한다.
- 시뮬레이션 신호: `timeout` 초기 로그와 `Missing timeout` 결함 카드.
- 학습 목표: thread occupancy plateau와 API 응답 지연의 상관관계를 찾는다.
- 개선 방향: connect/read/write timeout, global request deadline, cancellation propagation을 설정한다.

## 6. 긴급 알림 전송 지연 및 소실

- 패턴: Mail/SMS 알림 채널 처리량이 incident ingress보다 낮아 backlog와 drop이 발생한다.
- 시뮬레이션 신호: RabbitMQ `incident.alert.sms`, `notification` 로그.
- 학습 목표: 알림 자체가 장애 병목이 되는 상황을 구분한다.
- 개선 방향: priority queue, provider failover, alert deduplication, durable outbox를 적용한다.

## 7. 타임존 연산 오류

- 패턴: 관제 센터 KST 시간과 해저 노드 UTC 시간을 직접 비교한다.
- 시뮬레이션 신호: `timezone` 로그에 KST/UTC direct compare 메시지 출력.
- 학습 목표: 시간대 착오가 SLA window, heartbeat freshness, incident ordering을 왜곡하는 방식을 학습한다.
- 개선 방향: 내부 저장은 `Instant`/UTC로 통일하고 UI 렌더링 단계에서만 지역 시간을 변환한다.

## 8. 그레이스풀 셧다운 실패

- 패턴: 종료 신호 수신 시 작업 drain 없이 즉시 종료된다.
- 시뮬레이션 구성: `application.yml`의 `server.shutdown: immediate`.
- 학습 목표: in-flight task 손실, partial write, 중복 재처리 신호를 감지한다.
- 개선 방향: `server.shutdown: graceful`, lifecycle timeout, preStop hook, queue drain 확인을 적용한다.

## 9. Cache-Control 누락에 따른 정적 리소스 지연

- 패턴: 정적 리소스 캐시 정책이 없거나 no-store로 잘못 적용되어 매 요청 asset reload가 발생한다.
- 시뮬레이션 구성: `spring.web.resources.cache.cachecontrol.no-store: true`로 잘못된 캐시 정책을 노출한다.
- 학습 목표: 정적 리소스 loading delay와 실제 API 병목을 분리한다.
- 개선 방향: fingerprinted assets에는 `max-age=31536000, immutable`, HTML shell에는 짧은 cache 또는 no-cache를 적용한다.

## 10. 중복 실행 백그라운드 스케줄러

- 패턴: 이전 작업 종료 여부 확인 없이 동일 주기의 scheduler 두 개가 동시에 실행된다.
- 시뮬레이션 로직: `emitAvailabilityPulseA`, `emitAvailabilityPulseB`가 같은 `fixedRate`로 availability log를 생성한다.
- 학습 목표: scheduler overlap과 telemetry 중복, resource contention을 식별한다.
- 개선 방향: single scheduler ownership, distributed lock, previous-run completion guard를 적용한다.

## 11. Distributed Lock 실패

- 패턴: 분산 락이 local-only 또는 만료 토큰 없이 동작해 두 노드가 동시에 권한을 획득한다.
- 시뮬레이션 신호: `distributed-lock` 로그, `Distributed lock split brain` 결함 카드.
- 학습 목표: lock lease, fencing token, split-brain 징후를 구분한다.
- 개선 방향: Redis/etcd/ZooKeeper 기반 lock, fencing token, monotonic revision 검증을 적용한다.

## 운영 격리 확인

- 외부 진입점은 `http://localhost:9095` 하나로 고정한다.
- 프론트엔드 API 호출은 모두 상대 경로 `/api/...`를 사용한다.
- Spring Boot 전역 CORS는 `http://localhost:9095`, `http://127.0.0.1:9095`만 허용한다.
- Docker Compose는 호스트 포트 `9095`를 컨테이너 포트 `9095`로 매핑한다.
- 이전 프로젝트 포트 범위는 코드와 구성에 포함하지 않는다.
