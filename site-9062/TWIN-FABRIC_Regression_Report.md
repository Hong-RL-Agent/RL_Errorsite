# TWIN-FABRIC Regression Report

## 개요

TWIN-FABRIC은 스마트 팩토리 디지털 트윈의 복구 프로세스를 연구하기 위한 샌드박스입니다. 본 구현은 실제 시스템 장애를 유발하지 않고, API 메모리 상태와 대시보드 관측값만 변경하는 안전한 방식으로 11가지 복구 결함을 재현합니다.

## 실행 환경

- UI: `http://localhost:9062`
- API node A: `http://localhost:9063`
- API node B: `http://localhost:9064`
- 실행 명령: `docker compose up --build`

## API 요약

- `GET /api/telemetry`: 설비 상태, 데이터 스트림, 노드 헬스 상태 조회
- `GET /api/scenarios`: 복구 결함 시나리오 목록 조회
- `POST /api/scenarios/{id}/trigger`: 지정 시나리오 안전 트리거
- `GET /api/health/synthetic`: 의도적으로 부정확할 수 있는 연구용 헬스 체크

## 결함 시나리오 분석

| ID | 시나리오 | 구현 위치 | 재현 방식 | 관측 지표 |
| --- | --- | --- | --- | --- |
| 1 | 분산 추적 컨텍스트 유실 | `RecoverySimulationService.trigger(1)` | Trace ID를 빈 값으로 설정하고 telemetry에 `MISSING_TRACE_CONTEXT` 표시 | 데이터 스트림 `trace` 항목 amber |
| 2 | 세션 동기화 실패 | `trigger(2)` | 권한 캐시 지연 시간을 420초로 표시 | `session-cache` stale 값 증가 |
| 3 | 우아한 성능 저하 실패 | `trigger(3)` | 비핵심 기능 중단 fallback 실패를 `FAILED` 상태로 표시 | 복구 진행률 카드 `FAILED` |
| 4 | 장애 전환 시 데이터 정합성 파손 | `trigger(4)` | DB failover 중 누락 write 카운터 증가 | `failover-gap` dropped writes |
| 5 | 부정확한 헬스 체크 응답 | `trigger(5)`, `/api/health/synthetic` | 내부 PLC bus down에도 외부 status는 `UP` 유지 | 노드 헬스에서 component offline |
| 6 | 로그 폭주 스토리지 고갈 | `trigger(6)` | 실제 로그 대량 쓰기 없이 폭주 카운터만 증가 | `log-burst` lines/s simulated |
| 7 | 인프라 할당량 초과 복구 중단 | `trigger(7)` | 복구 워커 할당량 초과 상태 표시 | 노드 상태 `RECOVERY_DENIED` |
| 8 | DNS 전파 지연 페일오버 차단 | `trigger(8)` | stale DNS cache 플래그 활성화 | 설비 상태 `STALE_ROUTE` |
| 9 | 복구 데이터 대량 로드 메모리 스파이크 | `trigger(9)` | backlog row 수를 크게 증가 | 노드 memory load 급증 |
| 10 | 복구 직후 속도 제한 오판 | `trigger(10)` | false block 카운터 증가 | `rate-limit` false blocks |
| 11 | 원거리 지역 복구 지연시간 폭증 | `trigger(11)` | backup region active 및 latency 10배 수준 표시 | 노드 latency 780ms 이상 |

## 안전장치

- 실제 디스크 고갈, 네트워크 공격, 대량 메모리 할당은 수행하지 않습니다.
- 로그 폭주는 카운터 값으로만 표현합니다.
- 메모리 스파이크는 backlog 수치와 대시보드 지표로만 표현합니다.
- DNS 지연과 리전 지연은 클라이언트 라우팅 상태와 latency 값으로만 표현합니다.
- 모든 결함은 프로세스 내부 volatile 상태 변경으로 제한되며 컨테이너 재시작 시 초기화됩니다.

## 회귀 관측 절차

1. `docker compose up --build`로 UI와 두 API 노드를 실행합니다.
2. `http://localhost:9062`에서 복구 진행률 대시보드를 확인합니다.
3. 시나리오를 선택하고 `시나리오 트리거` 버튼을 누릅니다.
4. 실시간 공정 데이터 스트림, 설비 상태 렌더링, 노드 헬스 인디케이터가 결함별로 바뀌는지 확인합니다.
5. 시나리오 5 실행 후 `http://localhost:9063/api/health/synthetic`가 `status: UP`을 유지하면서 내부 컴포넌트가 offline으로 표시되는지 검증합니다.

## 아키텍처 메모

멀티 노드 구성은 Docker Compose의 `twin-fabric-api-a`, `twin-fabric-api-b` 두 Spring Boot 인스턴스로 구성됩니다. 현재 샌드박스에서는 외부 영속 저장소 없이 노드별 메모리 상태로 결함을 재현하므로, 에이전트가 복구 전략을 반복 학습하기 쉽고 실행 환경의 부작용도 낮습니다.

