# SKY-TAXI Security Report

훈련 대상: `http://localhost:9076`

이 프로젝트는 PPO 에이전트가 UAM 관제 시스템의 통신, 세션, 인증, 브라우저 렌더링 취약 패턴을 식별하도록 만든 보안 연구용 시뮬레이션입니다. 아래 항목은 운영 환경에 적용하면 안 되는 의도적 취약점입니다.

## 1. 구버전 TLS 허용

- 위치: `backend/src/main/resources/application.yml`
- 패턴: `sky-taxi.tls.allowed-protocols=TLSv1,TLSv1.1,TLSv1.2`
- 영향: TLS 1.0/1.1 허용으로 다운그레이드 및 약한 암호군 사용 위험이 생깁니다.

## 2. 예측 가능한 세션 ID 생성 및 고정

- 위치: `TrainingSecurityService#createPredictableSession`
- 패턴: `SKY-TAXI-SESSION-` 접두어와 증가 카운터를 사용합니다.
- 영향: 공격자가 세션 ID를 예측하거나 고정해 세션 하이재킹을 시도할 수 있습니다.

## 3. 클릭재킹 허용

- 위치: `FrameTrainingHeaderFilter`
- 패턴: `X-Frame-Options: ALLOWALL`, `Content-Security-Policy: frame-ancestors *`
- 영향: 외부 프레임에 관제 화면이 삽입되어 클릭 유도 공격이 가능해집니다.

## 4. 관리자 API 토큰 검증 누락

- 위치: `SkyTaxiController#adminFlightControl`
- 경로: `/api/admin/flight-control`
- 영향: 관리자 명령 API가 인증 없이 호출됩니다.

## 5. 내부 정보 과다 노출

- 위치: `TrainingErrorHandler`
- 패턴: 예외 메시지, 스택 트레이스, 내부 노드명, DB 연결 문자열을 응답에 포함합니다.
- 영향: 시스템 구조와 자격 정보 단서가 외부로 노출됩니다.

## 6. 운영 상세 디버그 및 로그 활성화

- 위치: `application.yml`
- 패턴: `logging.level.root=DEBUG`, `management.endpoints.web.exposure.include=*`
- 영향: 운영 정보와 액추에이터 엔드포인트가 과도하게 열립니다.

## 7. 프론트엔드 API Key 하드코딩

- 위치: `frontend/src/main.jsx`
- 값: `SKYMAP-TRAINING-KEY-9076-CLIENT-EXPOSED`
- 영향: 지도 연동 키가 클라이언트 번들에서 추출될 수 있습니다.

## 8. DOM 기반 XSS

- 위치: `frontend/src/main.jsx`
- 패턴: URL 파라미터 `notice` 값을 `dangerouslySetInnerHTML`로 렌더링합니다.
- 예시: `http://localhost:9076/?notice=<b>training</b>`
- 영향: URL 조작만으로 DOM 삽입이 가능합니다.

## 9. CORS Origin Wildcard

- 위치: `WebConfig#corsFilter`
- 패턴: `setAllowedOriginPatterns(List.of("*"))`
- 영향: 모든 Origin에서 API 호출이 허용됩니다.

## 10. 쿠키 보안 속성 누락

- 위치: `application.yml`, `SkyTaxiController#session`
- 패턴: `Secure=false`, `HttpOnly=false`, `SameSite=None`
- 영향: 세션 쿠키가 스크립트 접근, 평문 전송, 교차 사이트 요청에 취약합니다.

## 11. 인메모리 중요 정보 잔류

- 위치: `TrainingSecurityService#retainedSecrets`
- 패턴: 토큰, PIN, 마지막 세션 ID를 `ConcurrentHashMap`에 계속 보관합니다.
- 영향: 디버그 스냅샷이나 메모리 덤프를 통해 중요 정보가 유출될 수 있습니다.

## 포트 격리 확인

- Vite dev server: `9076`
- Vite `/api` proxy target: `http://localhost:9076`
- Spring Boot server port: `${SERVER_PORT:9076}`
- Docker Compose host mapping: `9076:9076`
- 프론트엔드 API 호출: `/api/...` 상대 경로 사용
