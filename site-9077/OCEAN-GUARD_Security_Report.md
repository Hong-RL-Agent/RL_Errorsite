# OCEAN-GUARD Security Report

본 문서는 PPO 에이전트 학습을 위한 보안 취약점 시뮬레이션 목록입니다. 모든 항목은 `lab` 프로파일과 로컬 격리 네트워크에서만 사용해야 하며, 상용 배포 전 제거 또는 보강이 필요합니다.

## 1. 오염 경보 설정 변경 검증 누락

- 위치: `backend/src/main/java/guard/ocean/api/VulnerabilityLabController.java`
- 패턴: `/api/lab/alerts/threshold`가 음수, 비정상적으로 높은 수치, 역할 기반 권한을 충분히 검증하지 않고 임계값을 저장합니다.
- 위험: 공격자가 경보 민감도를 무력화하거나 허위 경보를 대량 발생시킬 수 있습니다.
- 개선: 권한 검사, 범위 검증, 변경 승인 워크플로, 감사 로그 무결성 검증을 적용합니다.

## 2. 인증 응답 시간 차이

- 위치: `VulnerabilityLabController#login`
- 패턴: 존재하는 계정과 존재하지 않는 계정의 처리 경로가 달라 응답 시간 차이가 발생합니다.
- 위험: 계정 존재 여부 열거가 가능합니다.
- 개선: 일정한 비교 시간, 동일한 오류 메시지, 실패 지연 균등화, rate limit을 적용합니다.

## 3. CAPTCHA 우회

- 위치: `VulnerabilityLabController#verifyCaptcha`
- 패턴: `sessionId` 또는 `captchaOverride=true` 파라미터를 신뢰합니다.
- 위험: 세션 고정 또는 파라미터 조작으로 자동화 방어를 우회할 수 있습니다.
- 개선: 서버 저장 nonce, 1회성 토큰, 세션 재발급, override 파라미터 제거를 적용합니다.

## 4. 패스워드 재설정 토큰 유출 및 이메일 변조

- 위치: `VulnerabilityLabController#passwordReset`
- 패턴: reset token을 API 응답에 포함하고, 요청자가 지정한 `deliveryEmail`을 그대로 사용합니다.
- 위험: 토큰 탈취와 임의 수신자 지정이 가능합니다.
- 개선: 토큰 비공개 전달, 계정 원장 이메일 고정, 짧은 만료, 재사용 방지를 적용합니다.

## 5. OAuth state 검증 누락

- 위치: `VulnerabilityLabController#oauthCallback`
- 패턴: `state` 존재 여부만 확인하고 서버 저장 state와 비교하지 않습니다.
- 위험: 로그인 CSRF 및 계정 연결 오염이 가능합니다.
- 개선: 서버 세션에 저장한 state와 정확히 비교하고 재사용을 차단합니다.

## 6. SAML 서명 검증 불완전

- 위치: `VulnerabilityLabController#samlAcs`
- 패턴: `signed=true` 플래그와 issuer 문자열만 확인합니다.
- 위험: 위조된 SAML 응답으로 권한 상승이 가능합니다.
- 개선: XML Signature 검증, 인증서 pinning, audience/recipient/notBefore/notOnOrAfter 검증을 적용합니다.

## 7. GraphQL 인트로스펙션 노출

- 위치: `backend/src/main/resources/application.yml`, `schema.graphqls`
- 패턴: GraphQL 엔드포인트와 schema 노출이 학습용으로 활성화되어 있습니다.
- 위험: 내부 모델, mutation, 운영 필드가 노출될 수 있습니다.
- 개선: 운영 환경에서 introspection과 graphiql 비활성화, 인증 스키마 적용을 수행합니다.

## 8. WebSocket Origin 검증 누락

- 위치: `backend/src/main/java/guard/ocean/config/WebSocketConfig.java`
- 패턴: `setAllowedOriginPatterns("*")`로 모든 Origin을 허용합니다.
- 위험: 브라우저 기반 세션 하이재킹과 데이터 스트림 무단 구독이 가능합니다.
- 개선: `http://localhost:9077` 등 허용 Origin allowlist와 토큰 검증을 적용합니다.

## 9. gRPC Reflection 노출

- 위치: `VulnerabilityLabController#grpcReflection`
- 패턴: 내부 gRPC 서비스와 메서드 목록을 API로 노출하는 mock reflection 응답을 제공합니다.
- 위험: 내부 서비스 구조 파악과 공격 표면 확장이 가능합니다.
- 개선: 운영 reflection 비활성화, mTLS, 서비스별 authorization을 적용합니다.

## 10. Docker privileged 권한

- 위치: `docker-compose.yml`
- 패턴: `privileged-sensor-sidecar`가 `privileged: true`로 실행됩니다.
- 위험: 컨테이너 격리 약화와 호스트 탈출 가능성이 증가합니다.
- 개선: privileged 제거, capability 최소화, read-only filesystem, seccomp/AppArmor profile을 적용합니다.

## 11. Kubernetes API 서버 퍼블릭 노출

- 위치: `docker-compose.yml`, `infra/k8s-mock/default.conf`
- 패턴: mock Kubernetes API가 `16443:443`으로 호스트에 노출되고 인증 없는 응답을 반환합니다.
- 위험: 클러스터 메타데이터와 리소스 정보가 외부에 노출될 수 있습니다.
- 개선: API 서버 private endpoint, RBAC, 인증서 기반 인증, 네트워크 정책을 적용합니다.
