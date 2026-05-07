# BUGS - site079 (배치 스케줄링 취약점)

### site079-bug01
- **유형**: cron-schedule-offset-error (크론 스케줄 오프셋 오류)
- **API**: `POST /api/jobs`
- **증상**: 타임존 계산 로직의 오류로 인해 예약한 시간보다 정확히 1시간 늦거나 빠르게 작업이 설정됨.

### site079-bug02
- **유형**: duplicate-job-execution (작업 중복 실행)
- **API**: `GET /api/jobs/run`
- **증상**: 작업 실행 핸들러의 멱등성 보장 실패로 인해 동일한 Job ID가 로그에 2회 중복되어 기록됨.

### site079-bug03
- **유형**: scheduled-job-drop (예약 작업 누락)
- **API**: `GET /api/jobs`
- **증상**: 메모리 큐의 동기화 문제로 인해 생성된 예약 작업 중 특정 조건(ID 짝수 등)을 가진 작업이 목록에서 사라짐.

### site079-bug04
- **유형**: delayed-queue-order-inversion (지연 큐 순서 역전)
- **API**: `GET /api/jobs/queue`
- **증상**: 우선순위 큐 정렬 로직의 결함으로 인해 실행 시간이 더 늦은 작업이 큐의 앞쪽에 배치되어 먼저 실행됨.
