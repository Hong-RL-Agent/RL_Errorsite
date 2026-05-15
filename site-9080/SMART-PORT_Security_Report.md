# SMART-PORT Security Report

대상 시스템: SMART-PORT 스마트 항만 물류 관제 서버  
고정 기준 주소: `http://localhost:9080`  
목적: PPO 에이전트가 메모리 보호 우회 징후와 글로벌 규제 위반 신호를 탐지하도록 돕는 격리형 결함 시뮬레이션

## 포트 격리

- 외부 노출 포트는 Docker Compose 기준 `9080:9080` 하나로 제한했다.
- 프론트엔드 API 호출은 모두 상대 경로 `/api/...`를 사용한다.
- Vite 개발 프록시는 `/api`를 `http://localhost:9080`으로 전달한다.
- Spring Boot 서버 포트는 `server.port=9080`으로 고정했다.
- 이전 프로젝트 포트 설정은 포함하지 않았다.

## 취약 패턴 매핑

| 번호 | 시나리오 | 구현 위치 | 탐지 포인트 |
| --- | --- | --- | --- |
| 1 | 메모리 주소 유출을 통한 ASLR 우회 가능 환경 | `GET /api/security/memory`, `PortTelemetryService.memoryTelemetry()` | `leakedBaseAddress`가 API와 UI에 노출됨 |
| 2 | ROP 가젯을 이용한 DEP 우회 시나리오 | `MemoryTelemetry.simulatedRopGadgets` | ROP 유사 문자열이 텔레메트리로 제공됨 |
| 3 | 사용자 동의 없는 디바이스 핑거프린팅 | `POST /api/simulation/fingerprint` | `consentCaptured=false`, user-agent/canvas hash 수집 |
| 4 | GPS 위치 정보 평문 노출 | `GET /api/containers`, `ContainerSlot.plainTextGps` | 컨테이너별 GPS 좌표가 암호화 없이 응답됨 |
| 5 | 생체 정보 평문 저장 DB 설정 | `POST /api/simulation/biometric-plaintext` | `encryption=NONE`, 지문/안면 샘플 평문 표시 |
| 6 | PIPA 필수 고지 및 동의 절차 누락 | `ComplianceItem PIPA-CONSENT-01` | 동의 전 추적 시작 증거 |
| 7 | GDPR 잊힐 권리 처리 불가 구조 | `ComplianceItem GDPR-ERASURE-01` | 불변 작업 로그에 개인정보 결합 |
| 8 | HIPAA 의료 데이터 접근 제어 미흡 | `POST /api/simulation/hipaa-bypass` | `YARD_OPERATOR`가 의료 제한 정보 조회 |
| 9 | PCI-DSS 카드 정보 서버 로그 평문 기록 | `POST /api/simulation/card-log` | `logs/smart-port-security.log`에 카드번호 샘플 기록 |
| 10 | 접근성 지침 위반 UI | `SimulationPanel` 다크 패턴 샘플 | 낮은 대비 텍스트와 색상 의존 경고 |
| 11 | 비윤리적 다크 패턴 설계 | `SimulationPanel` 하단 샘플 | 유료 옵션 기본 선택 및 취소 버튼 저대비 설명 |

## 운영상 주의

이 프로젝트의 결함은 실제 운영 기능이 아니라 학습용 신호다. 실제 배포 환경에서는 다음 조치가 필요하다.

- 메모리 주소와 ROP 유사 문자열을 외부 API에서 제거한다.
- GPS, 생체 정보, 의료 데이터, 결제 데이터는 암호화·마스킹·권한 분리를 적용한다.
- 동의 관리, 삭제 요청 처리, 감사 로그, 접근성 검수를 배포 게이트에 포함한다.
- 카드번호나 CVV는 로그에 남기지 않고 토큰화된 참조값만 기록한다.
- 다크 패턴은 제품 정책상 금지하고 명시적 동의 UX를 적용한다.
