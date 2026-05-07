# BUGS - site019

이 문서는 PPO 에이전트 탐지용으로 의도적으로 삽입된 백엔드 버그들을 설명합니다.

---

### site019-bug01
- **ID**: site019-bug01
- **유형**: social-logout-orphan-session
- **API**: `POST /api/auth/logout`, `GET /api/user/profile`
- **조건**: 사용자가 로그아웃을 수행한 후, 해당 세션 ID를 사용하여 프로필 조회를 시도할 때 발생.
- **응답**: `HTTP 200` (로그아웃 성공 메시지) 이후, 프로필 조회 시 여전히 사용자 정보가 반환됨.
- **원인**: 서버에서 로그아웃 요청 시 세션 저장소에서 해당 세션을 삭제하지 않음.
- **PPO 탐지 목표**: 로그아웃 후에도 세션이 유효한지 확인하여 "유령 세션" 상태를 탐지.

---

### site019-bug02
- **ID**: site019-bug02
- **유형**: external-service-maintenance-unhandled
- **API**: `POST /api/payment/process?mode=maintenance`
- **조건**: 결제 시 `mode=maintenance` 파라미터가 포함될 때 발생.
- **응답**: `HTTP 500` + `bugId: site019-bug02`
- **원인**: 외부 결제 서비스의 점검 상태를 백엔드에서 적절히 예외 처리하지 못하고 서버 에러를 발생시킴.
- **PPO 탐지 목표**: 외부 서비스 장애 또는 점검 상황에서 시스템이 붕괴되는 지점을 탐지.

---

### site019-bug03
- **ID**: site019-bug03
- **유형**: external-library-breaking-change
- **API**: `GET /api/movies/schedule`
- **조건**: 상영 시간표를 조회할 때 발생.
- **응답**: `HTTP 200`, 하지만 특정 데이터의 날짜 필드가 문자열이 아닌 객체(`{ timestamp: ... }`)로 반환됨.
- **원인**: 외부 날짜 라이브러리의 업데이트로 인한 데이터 포맷 변경(Breaking Change)이 백엔드 로직에 반영되지 않음.
- **PPO 탐지 목표**: API 응답 데이터의 스키마 변경으로 인한 프론트엔드/데이터 정합성 오류 탐지.

---

### site019-bug04
- **ID**: site019-bug04
- **유형**: payment-webhook-idempotency-failure
- **API**: `POST /api/payment/webhook`
- **조건**: 동일한 `paymentId`에 대해 웹훅이 2회 이상 호출될 때 발생.
- **응답**: `HTTP 200`, 하지만 중복 처리 카운트가 증가함.
- **원인**: 결제 완료 웹훅 처리 시 멱등성(Idempotency) 체크 로직이 누락되어 동일 요청을 반복 처리함.
- **PPO 탐지 목표**: 중복 요청에 대한 시스템의 비정상적인 처리 로직 탐지.
