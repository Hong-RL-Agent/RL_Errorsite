# AI-EDUCATION Security Report

본 문서는 `AI-EDUCATION` 로컬 훈련 환경에 의도적으로 포함된 취약 패턴을 정리한다.

기준 주소는 전체 프로젝트에서 `http://localhost:9093`으로 고정한다. 모든 항목은 PPO 에이전트가 애플리케이션 로직 결함과 네트워크 기반 복합 공격 신호를 학습하도록 설계된 시뮬레이션이다.

## Scope

- Frontend: React + Vite + Tailwind v4
- Backend: Spring Boot 3.x
- WebSocket: `/ws/classroom`
- API Base: `/api`
- Isolation Port: `9093`

## Vulnerability Inventory

| No | Pattern | Location | Training Signal |
| --- | --- | --- | --- |
| 1 | SSTI | `POST /api/lab/report/render` | 사용자 제공 템플릿 문자열을 서버 템플릿 엔진이 평가 |
| 2 | HPP | `GET /api/lab/hpp/grade` | 중복 `role` 파라미터 중 마지막 값을 권한 결정에 사용 |
| 3 | CRLF Injection | `GET /api/lab/crlf/export` | 파일명 입력을 응답 헤더에 직접 반영 |
| 4 | DNS Rebinding | `GET /api/lab/dns/internal-metadata` | `Host` 헤더만으로 내부 자원 접근 여부 판단 |
| 5 | Cache Poisoning | `GET /api/lab/cache/course` | `X-Forwarded-Host`를 캐시 가능한 응답과 캐시 키에 반영 |
| 6 | GraphQL Introspection | `POST /api/lab/graphql` | `__schema` 요청 시 내부 타입과 쿼리 목록 노출 |
| 7 | Weak Password Policy | `POST /api/lab/password/register` | 숫자 4~6자리 비밀번호를 허용 |
| 8 | Weak CAPTCHA/Bot Defense | `POST /api/lab/captcha/verify` | 정적 답변 `42`로 자동화 우회 가능 |
| 9 | Email/SMS Spoofing Gap | `POST /api/lab/notify/send` | 발신자 소유권, 도메인, 서명 검증 없이 큐 처리 |
| 10 | Predictable UID | `POST /api/lab/users/create` | `1001`, `1002` 형태의 순차 UID 생성 |
| 11 | WebSocket Missing Auth | `GET /ws/classroom` | 연결 시 토큰, 역할, 세션 권한 검증 없음 |

## Defensive Expectations

훈련 목표는 공격 재현이 아니라 탐지와 방어 설계다. 에이전트는 다음 신호를 관찰해야 한다.

- 입력값이 템플릿, 헤더, 캐시 키, 리다이렉트, 권한 결정에 도달하는 흐름
- 중복 파라미터와 조작 가능한 헤더가 신뢰 경계에 미치는 영향
- 스키마, UID, 보안 로그, 내부 메타데이터의 과다 노출 여부
- 연결 수립 전 인증이 없는 WebSocket 채널
- 봇 방어와 알림 발신자 검증처럼 비즈니스 로직 계층의 약한 통제

## Recommended Remediation Map

| Pattern | Recommended Control |
| --- | --- |
| SSTI | 서버 템플릿 원문 입력 금지, 허용된 변수만 매핑, 샌드박스 렌더러 사용 |
| HPP | 중복 파라미터 거부, canonical parameter parser 적용 |
| CRLF | 헤더 값 CR/LF 제거, 파일명 allowlist와 RFC 5987 인코딩 적용 |
| DNS Rebinding | Host allowlist, Origin 검증, 내부 메타데이터 네트워크 격리 |
| Cache Poisoning | 신뢰 헤더 제한, 캐시 키 정규화, `Vary` 정책 명확화 |
| GraphQL | 운영 introspection 비활성화, 필드 단위 권한 검증 |
| Password | 길이, 다양성, 유출 비밀번호 차단, rate limit 적용 |
| CAPTCHA | 서버 발급 nonce, 만료 시간, 행동 기반 봇 방어 추가 |
| Spoofing | SPF/DKIM/DMARC, 발신 번호 소유권 검증, 서명된 발송 요청 |
| UID | 난수 기반 식별자 또는 UUID/ULID 사용 |
| WebSocket | handshake interceptor에서 토큰 검증, 채널별 역할 권한 적용 |

## Docker Log Simulation

`docker-compose.yml`은 `SIMULATION_LOG_LEVEL=training` 환경 값을 설정한다. 백엔드 `/api/logs/security`는 캐시, WebSocket, 리포트 템플릿 처리와 관련된 보안 사고형 로그를 반환한다.
