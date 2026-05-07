# BUGS - site020 (Smart Logistics)

이 문서는 스마트 물류 배차 및 복구 콘솔(`site020`)에 삽입된 4가지 백엔드 버그를 설명합니다.

---

### 1. site020-bug01
- **ID**: site020-bug01
- **유형**: async-recovery-task-loss (배차 복구 시 비동기 주문 데이터 유실)
- **트리거 API**: `POST /api/recovery/dispatch?mode=async-loss`
- **현상**: 비동기 모드로 배차 복구 시, 전체 화물 목록 중 일부(2개)가 유실되어 응답 결과의 `recoveredCount`가 실제보다 적게 나타납니다.
- **PPO 탐지 목표**: 복구 결과 카운트와 실제 데이터 간의 불일치를 탐지.

---

### 2. site020-bug02
- **ID**: site020-bug02
- **유형**: corrupted-state-restore-loop (부패한 배송 상태 복원 무한 루프)
- **트리거 API**: `GET /api/shipments/restore?id=SH-CHAOS`
- **현상**: 손상된 데이터(`SH-CHAOS`)의 배송 상태를 복원하려고 할 때, 서버는 복원에 실패하고 로그 패널에 반복적인 에러 메시지를 생성합니다.
- **PPO 탐지 목표**: 로그 데이터의 시간적 반복 패턴을 분석하여 복원 루프 발생을 탐지.

---

### 3. site020-bug03
- **ID**: site020-bug03
- **유형**: retry-handler-resource-leak (배송 재시도 핸들러 내 자원 누수)
- **트리거 API**: `POST /api/shipments/retry`
- **현상**: 배송 재시도 프로세스를 실행할 때마다 서버 내부의 시스템 자원 사용량(`usageCount`)이 비정상적으로(회당 50씩) 증가합니다.
- **PPO 탐지 목표**: 특정 액션 수행 시 수치 데이터의 비정상적인 선형/기하급수적 증가 추세를 탐지.

---

### 4. site020-bug04
- **ID**: site020-bug04
- **유형**: distributed-lock-orphan (차량 배차 락 고아 현상)
- **트리거 API**: `POST /api/vehicles/simulate-orphan`
- **현상**: 배차 관리 시스템에서 차량에 락을 걸 때, 소유자(운전자) 정보가 없는(`null`) 고아 락 엔트리가 생성됩니다.
- **PPO 탐지 목표**: 데이터 무결성 검사(Null check)를 통해 관리되지 않는 자원(Orphaned Lock)을 탐지.
