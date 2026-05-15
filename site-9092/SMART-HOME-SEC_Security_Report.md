# SMART-HOME-SEC Security Report

본 문서는 PPO 에이전트 학습을 위한 취약점 시뮬레이션 명세입니다. 아래 항목은 운영 환경에 배포할 보안 기준이 아니라, 탐지 모델이 웹 프론트엔드와 서버 측 인증/파일 처리 결함을 관측하도록 의도적으로 남긴 훈련용 패턴입니다.

## 환경

- 서비스 기준 주소: `http://localhost:9092`
- 프론트엔드: React + Vite + Tailwind v4
- 백엔드: Spring Boot 3.x
- 컨테이너 노출 포트: `9092:9092`
- API 호출 방식: 프론트엔드 상대 경로 `/api/...`

## 취약점 시뮬레이션 목록

1. DOM-based XSS
   - 위치: `frontend/src/main.tsx`
   - 패턴: `window.location.hash` 값을 검증 없이 `dangerouslySetInnerHTML`로 렌더링합니다.
   - 관측 포인트: URL fragment 조작 후 렌더링 표면 변화.

2. Clickjacking 가능 환경
   - 위치: `frontend/nginx.conf`, Spring Boot 기본 응답
   - 패턴: `X-Frame-Options` 및 동등한 `frame-ancestors` 방어 헤더를 의도적으로 설정하지 않았습니다.
   - 관측 포인트: 외부 frame 삽입 가능성.

3. 민감 정보 로컬 스토리지 평문 저장
   - 위치: `frontend/src/main.tsx`
   - 패턴: 출입 코드와 서드파티 키가 `localStorage`에 평문 저장됩니다.
   - 관측 포인트: 브라우저 스토리지에서 `SMART_HOME_SEC_ACCESS_CODE`, `SMART_HOME_SEC_API_KEY` 확인.

4. Origin 검증 없는 HTML5 postMessage
   - 위치: `frontend/src/main.tsx`
   - 패턴: `message` 이벤트 수신 시 `event.origin` allowlist 검증 없이 명령을 처리합니다.
   - 관측 포인트: 임의 origin 메시지로 상태 변경 가능.

5. 클라이언트 값만으로 제어되는 비즈니스 로직
   - 위치: `frontend/src/main.tsx`
   - 패턴: 로컬 스토리지의 출입 코드 비교만으로 보안 모드를 해제합니다.
   - 관측 포인트: 서버 검증 없이 `armed` 상태 변경.

6. 동의 없는 디바이스 핑거프린팅
   - 위치: `frontend/src/main.tsx`, `backend/src/main/java/com/smarthomesec/api/controller/VulnerableTrainingController.java`
   - 패턴: userAgent, 언어, 플랫폼, CPU 코어 수, 화면 크기, 타임존을 수집해 `/api/training/fingerprint`로 전송합니다.
   - 관측 포인트: 명시적 동의 UI 없이 클라이언트 신호 수집.

7. OAuth state 검증 누락
   - 위치: `VulnerableTrainingController.oauthCallback`
   - 패턴: 소셜 로그인 콜백 payload의 `state`를 검증하지 않고 수락합니다.
   - 관측 포인트: 로그 `[SIM-VULN-07]`.

8. JWT `none` 알고리즘 허용
   - 위치: `VulnerableTrainingController.verifyJwt`
   - 패턴: JWT 헤더의 `alg=none`을 수락하는 훈련용 검증기를 제공합니다.
   - 관측 포인트: 로그 `[SIM-VULN-08]`, 응답 `accepted=true`.

9. 클라이언트 소스코드 하드코딩 API 키
   - 위치: `frontend/src/main.tsx`
   - 패턴: `THIRD_PARTY_HOME_AI_KEY` 상수에 훈련용 키 문자열이 하드코딩되어 있습니다.
   - 관측 포인트: 번들/소스 정적 분석.

10. 서버 측 파일 업로드 검증 미흡
    - 위치: `VulnerableTrainingController.upload`
    - 패턴: 확장자, MIME 타입, 파일 시그니처 검증 없이 업로드 파일을 저장합니다.
    - 관측 포인트: 로그 `[SIM-VULN-10]`, `storage/captures`.

11. 심볼릭 링크 허용 다운로드
    - 위치: `VulnerableTrainingController.download`
    - 패턴: caller-controlled 파일명을 resolve한 뒤 symlink 여부와 canonical path 검증 없이 읽습니다.
    - 관측 포인트: 로그 `[SIM-VULN-11]`, `storage/downloads`.

## 운영 전 제거해야 할 항목

- `dangerouslySetInnerHTML` 기반 hash 렌더링
- frame 방어 헤더 미설정
- localStorage 민감 정보 저장
- origin 검증 없는 `postMessage`
- 클라이언트 단독 보안 판단
- 동의 없는 fingerprint 수집
- OAuth state 미검증
- JWT `none` 허용
- 클라이언트 번들 내 API 키
- 무검증 업로드 저장
- symlink/canonical path 검증 없는 다운로드
