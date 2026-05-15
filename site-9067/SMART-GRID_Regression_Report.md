# SMART-GRID Regression Report

대상 시스템: SMART-GRID 전력망 관제 서버  
고정 노출 주소: `http://localhost:9067`  
API 호출 규칙: 프론트엔드는 `/api/...` 상대 경로만 사용  
목적: PPO 에이전트가 실시간 데이터 동시성 및 연산 무결성 결함을 학습할 수 있도록 관제/연산/브라우저 런타임 계층의 회귀 시나리오를 명시한다.

## 포트 및 격리 검증

- Spring Boot 서버 포트: `9067`
- Docker Compose 포트 매핑: `9067:9067`
- Vite 개발 서버 포트: `9067`
- Vite `/api` 프록시 기준 주소: `http://localhost:9067`
- 프론트엔드 API 호출 방식: `fetch('/api/grid/snapshot')`, `fetch('/api/grid/regressions')`
- 이전 프로젝트 포트 `9062`, `9063`, `9064`, `9065`, `9066` 사용 금지

## 결함 시나리오

| ID | 시나리오 | 계층 | 트리거 | 기대 결함 | 탐지 지표 | 심각도 |
|---:|---|---|---|---|---|---|
| 1 | 멀티 인스턴스 전력 분배 업데이트 시 DB 자원 잠금 현상 | DB/Transaction | 동일 구역 quota row를 4개 인스턴스가 pessimistic update | 락 대기 누적으로 배전 명령 지연 | `lock_wait_ms`, `deadlock_count` | Critical |
| 2 | NPU 드라이버와 런타임 버전 비호환에 따른 연산 중단 | NPU Runtime | driver ABI 2.1, runtime ABI 2.3 혼재 | 전력 예측 커널 로드 실패 | `npu_runtime_abi_mismatch` | Critical |
| 3 | 업데이트 중 심볼릭 링크 교체 시 발생하는 레이스 컨디션 | Updater | active 모델 symlink를 reader 동작 중 교체 | 일부 노드가 이전 가중치와 신규 설정을 혼합 사용 | `model_inode_switch_gap` | High |
| 4 | NPU 컴파일러 캐시 파일 손상에 의한 전력 계산 오차 | Compiler Cache | 캐시 blob checksum mismatch를 무시하고 실행 | MW 예측값 편차 확대 | `cache_checksum_error`, `prediction_delta` | High |
| 5 | 델타 업데이트 시 백신 프로그램의 파일 잠금으로 인한 타임아웃 | Patch IO | delta shard 쓰기 중 외부 파일 핸들 점유 | 패치 롤백과 런타임 부분 적용 | `patch_file_lock_timeout` | Medium |
| 6 | 업데이트 패치 중 AI 가중치 비트 반전(Bit-flip)으로 인한 할당량 폭주 | Model Integrity | quantized weight의 단일 비트 반전 | 특정 구역 전력 할당량 급증 | `weight_crc_failure`, `quota_spike` | Critical |
| 7 | 실시간 렌더링용 웹 워커 간의 상태 전이 교착 상태(Deadlock) | Web Worker | render worker와 aggregation worker가 서로 ACK 대기 | 그리드 맵 프레임 정지 | `worker_ack_stall` | High |
| 8 | 다중 탭 환경에서 공유 웹 워커 메시지 ID 충돌 현상 | Shared Worker | 탭별 로컬 counter를 전역 ID처럼 사용 | 다른 탭 응답이 현재 탭에 매칭 | `duplicate_message_id` | High |
| 9 | 웹 워커 메시지 큐 적체로 인한 데이터 전송 순서 역전 | Queueing | 긴 계산 task 뒤에 최신 telemetry가 먼저 commit | 시간축 역전 그래프 표시 | `out_of_order_sequence` | Medium |
| 10 | 구버전 서비스 워커의 잔류로 인한 데이터 스키마 불일치 | Service Worker | old SW가 v1 payload를 cache에서 반환 | 프론트 v2 parser 예외 | `schema_version_mismatch` | High |
| 11 | BF 캐시 복원 시 웹 워커 토큰 동기화 실패 및 통신 거부 | Browser Lifecycle | `pageshow persisted=true` 이후 worker token 미갱신 | 복원 탭의 worker command 거부 | `bf_cache_token_reject` | Medium |

## 구현 위치

- 백엔드 API: `src/main/java/city/smartgrid/api/GridController.java`
- 시뮬레이션 데이터: `src/main/java/city/smartgrid/service/GridTelemetryService.java`
- CORS 전역 설정: `src/main/java/city/smartgrid/config/CorsConfig.java`
- 프론트엔드 관제 화면: `frontend/src/main.tsx`
- 웹 워커 결함 신호: `frontend/src/workers/gridWorker.ts`
- Vite 프록시 설정: `frontend/vite.config.ts`
- Docker Compose 실행 설정: `docker-compose.yml`

## PPO 학습 관찰 포인트

- 동시성 결함은 큐 깊이, 메시지 ID, ACK 대기 상태, out-of-order sequence로 노출한다.
- 연산 무결성 결함은 NPU ABI, compiler cache checksum, AI weight CRC, quota spike로 노출한다.
- 브라우저 생명주기 결함은 service worker schema drift와 BF cache token rejection으로 노출한다.
- 관제 화면은 정상, 주의, 과부하 상태를 각각 `#22C55E`, `#FACC15`, `#EF4444`로 표시한다.
