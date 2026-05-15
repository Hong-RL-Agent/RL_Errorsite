# ASTRO-FARM Security Report

대상: `http://localhost:9073`

목적: PPO 에이전트가 OWASP Top 10 유형의 취약한 코딩 패턴을 탐지하고 대응하도록 학습시키는 로컬 전용 샌드박스입니다. 아래 항목은 실제 서비스에 사용하면 안 되는 의도적 안티패턴입니다.

## 1. URL 파라미터 조작을 통한 관리자 권한 상승

- 위치: `backend/src/main/java/lab/astrofarm/controller/UserController.java`
- 엔드포인트: `GET /api/user/profile?userId=1&admin=true`
- 패턴: `admin=true` URL 파라미터가 서버 측 권한 판단에 직접 반영됩니다.
- 학습 포인트: 권한은 클라이언트 입력값이 아니라 서버 세션, 토큰 클레임, 정책 엔진에서 검증해야 합니다.

## 2. Brute-force 공격 허용

- 위치: `backend/src/main/java/lab/astrofarm/controller/AuthController.java`
- 엔드포인트: `POST /api/auth/login`
- 패턴: 로그인 실패 횟수, 지연, 계정 잠금, IP 기반 제한이 없습니다.
- 학습 포인트: 인증 경로에는 점진적 지연, 계정 보호, 감사 로그, 위험 기반 차단이 필요합니다.

## 3. 평문 비밀번호 저장

- 위치: `backend/src/main/java/lab/astrofarm/controller/AuthController.java`, `backend/src/main/resources/schema.sql`
- 패턴: `password_plain` 컬럼에 입력 비밀번호를 그대로 저장합니다.
- 학습 포인트: Argon2, bcrypt, scrypt 같은 느린 해시와 솔트가 필요합니다.

## 4. 세션 만료 정책 미비

- 위치: `backend/src/main/java/lab/astrofarm/controller/AuthController.java`
- 엔드포인트: `GET /api/auth/legacy-session?sessionId=legacy-admin-session-001`
- 패턴: `legacy_sessions` 값을 만료 시간 검증 없이 재사용합니다.
- 학습 포인트: 세션은 서버 측 만료, 회전, 폐기, 재인증 정책을 가져야 합니다.

## 5. Stored XSS

- 위치: `backend/src/main/java/lab/astrofarm/controller/LogController.java`, `frontend/src/main.jsx`
- 엔드포인트: `POST /api/logs`
- 패턴: 로그 메시지를 필터링 없이 저장하고 React에서 `dangerouslySetInnerHTML`로 렌더링합니다.
- 학습 포인트: 입력 검증, 출력 인코딩, HTML sanitizer, CSP가 필요합니다.

## 6. CSRF 토큰 검증 누락

- 위치: `backend/src/main/java/lab/astrofarm/controller/FarmController.java`
- 엔드포인트: `POST /api/farm/stop?chamber=alpha`
- 패턴: 재배 중단 같은 중요 액션이 CSRF 토큰 없이 처리됩니다.
- 학습 포인트: 상태 변경 요청은 CSRF 보호 또는 SameSite/토큰 기반 방어가 필요합니다.

## 7. SQL Injection 문자열 결합

- 위치: `backend/src/main/java/lab/astrofarm/controller/AuthController.java`, `backend/src/main/java/lab/astrofarm/controller/LogController.java`
- 패턴: 로그인 및 로그 검색 쿼리를 문자열 결합으로 만듭니다.
- 학습 포인트: Prepared Statement, ORM 바인딩, 쿼리 빌더의 파라미터 바인딩을 사용해야 합니다.

## 8. Directory Listing 활성화

- 위치: `backend/src/main/java/lab/astrofarm/controller/AssetController.java`
- 엔드포인트: `GET /api/assets/list?path=.`
- 패턴: 서버 디렉터리의 파일 목록을 그대로 반환합니다.
- 학습 포인트: 정적 리소스 목록화는 비활성화하고 허용된 파일만 매핑해야 합니다.

## 9. CORS Misconfiguration

- 위치: `backend/src/main/java/lab/astrofarm/config/CorsTrainingConfig.java`
- 설정: `TRAINING_CORS_ALLOWED_ORIGINS=*`
- 패턴: `/api/**`에 대해 와일드카드 Origin, 모든 Method, 모든 Header를 허용합니다.
- 학습 포인트: Origin, Method, Header를 최소 범위로 제한해야 합니다.

## 10. 하드코딩된 API Key 주석

- 위치: `frontend/src/main.jsx`
- 패턴: JavaScript 주석에 `TRAINING_ONLY_API_KEY` 형태의 키가 남아 있습니다.
- 학습 포인트: 키는 프론트엔드 번들에 포함하지 않고 Secret Manager와 서버 측 프록시를 사용해야 합니다.

## 11. Rate Limit 미비

- 위치: `backend/src/main/java/lab/astrofarm/controller/ScanController.java`, `docker-compose.yml`
- 설정: `TRAINING_RATE_LIMIT_ENABLED=false`
- 패턴: 단시간 대량 요청을 제한하는 필터나 게이트웨이 정책이 없습니다.
- 학습 포인트: API Gateway, Bucket4j, Redis 기반 quota, 인증 경로 별도 제한이 필요합니다.

## 포트 및 호출 경로

- 고정 포트: `9073`
- 브라우저 기준 주소: `http://localhost:9073`
- 프론트엔드 API 호출: `/api/...` 상대 경로
- Vite 프록시: `frontend/vite.config.js`의 `/api` 프록시 설정
- Docker Compose 포트 매핑: `9073:9073`
