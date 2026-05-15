# QUANTUM-SIM Security Report

## Scope

- Service origin: `http://localhost:9074`
- Backend API namespace: `/api`
- Purpose: PPO 에이전트가 클라우드 네이티브 오설정과 최신 애플리케이션 취약점 신호를 탐지하도록 학습시키는 격리형 시뮬레이션
- Safety boundary: SSRF와 SSTI는 실제 내부 네트워크 호출 또는 템플릿 실행 없이 탐지, 차단, 격리 이벤트로만 모델링한다.

## Simulated Vulnerability Patterns

| ID | Pattern | Severity | Training Signal | Expected Remediation |
| --- | --- | --- | --- | --- |
| CVE-LIB-001 | 알려진 취약점(CVE)이 포함된 구버전 라이브러리 사용 | Critical | SBOM 또는 의존성 스캔에서 `Log4j 2.14.1` 같은 취약 패키지 잔존 | 취약 버전 제거, 고정 버전 정책, CI 의존성 스캔 |
| IAM-DRIFT-002 | 서버 인스턴스에 할당된 과도한 IAM 권한 드리프트 | High | `quantum-worker-role:*` 형태의 광범위 권한 | 최소 권한, 권한 경계, 정기 IAM Access Analyzer 검토 |
| S3-PUBLIC-003 | 연산 결과 저장용 S3 버킷 Public Read 개방 | Critical | `s3://quantum-results` 익명 읽기 가능 상태 | Block Public Access, 버킷 정책 검증, 민감 데이터 암호화 |
| SECRET-PLAIN-004 | DB 인증 정보 평문 노출 및 Secret Manager 미사용 | High | `DB_PASSWORD` 평문 환경 변수 또는 설정 파일 노출 | Secret Manager, KMS, 런타임 비밀 주입, 로그 마스킹 |
| OS-PATCH-005 | 최신 업데이트가 누락된 보안 취약 OS 환경 | Medium | 미패치 Ubuntu 20.04 기반 이미지 | 최신 베이스 이미지, 이미지 스캔, 자동 패치 파이프라인 |
| VPC-FLAT-006 | VPC 내 서브넷 격리 미비 | High | private DB subnet이 앱 서브넷에서 직접 접근 가능 | 라우팅 분리, NACL, 보안 그룹 참조 제한 |
| ACL-OPEN-007 | 인바운드 보안 그룹의 `0.0.0.0/0` 전면 개방 | Critical | SSH, DB 포트가 인터넷 전체에 노출 | 관리망 제한, Bastion 또는 SSM, 포트별 원천 차단 |
| AUDIT-GAP-008 | 중요 활동 기록이 누락된 감사 로그 부재 | Medium | CloudTrail data events 또는 관리자 활동 로그 누락 | 조직 단위 감사 로깅, 불변 로그 저장, 경보 연결 |
| IDOR-009 | 다른 사용자의 리포트를 조회할 수 있는 IDOR | High | `/api/reports/{reportId}`에서 owner scope 검증 누락 시나리오 | 객체 단위 인가, subject ownership 검증, 테스트 케이스 추가 |
| SSRF-010 | 서버를 통해 내부 메타데이터에 접근하는 SSRF | Critical | `169.254.169.254` 또는 metadata 주소 접근 시도 | egress allowlist, URL 파서 검증, IMDSv2, 네트워크 차단 |
| SSTI-011 | 템플릿 엔진 내 사용자 입력값 실행 | Critical | `{{...}}`, `${...}`, `<%...%>` 형태 입력 | 템플릿과 사용자 입력 분리, sandbox 제거 의존 금지, escape 정책 |

## API Mapping

- `GET /api/dashboard`: 큐비트 상태, 클라우드 자원, 11개 finding을 대시보드 데이터로 반환
- `GET /api/findings`: 취약 패턴 목록 반환
- `GET /api/reports/{reportId}`: IDOR 훈련 신호를 포함한 리포트 조회 시뮬레이션
- `POST /api/simulate/ssrf`: 내부 메타데이터 대상 여부를 판별하고 실제 네트워크 호출 없이 차단 결과 반환
- `POST /api/simulate/ssti`: 템플릿 표현식 형태를 판별하고 실제 평가 없이 격리 결과 반환

## Deployment Controls

- Public entrypoint is fixed to `http://localhost:9074`.
- Docker Compose exposes only the frontend service on host port `9074`.
- The backend remains on the isolated `quantum-sim-9074` bridge network and accepts CORS from `http://localhost:9074`.
- The frontend uses relative API paths and Vite `/api` proxying, preventing cross-project port leakage from 9062-9073.
