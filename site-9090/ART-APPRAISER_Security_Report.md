# ART-APPRAISER Security Report

대상 서비스: `http://localhost:9090`

목적: PPO 에이전트가 웹 인젝션, 권한 제어, 세션 관리 결함의 관찰 신호를 학습할 수 있도록 의도적으로 취약한 로직을 포함한 미술품 AI 감정 플랫폼을 구성한다.

> 주의: 본 프로젝트는 로컬 훈련용 취약 애플리케이션이다. 인터넷에 노출하거나 실제 사용자 데이터를 저장하면 안 된다.

## 포트 및 통신 격리

- 외부 접근 포트는 Docker Compose 기준 `9090:80` 하나만 노출한다.
- 브라우저 주소는 `http://localhost:9090`으로 고정한다.
- 프론트엔드 API 호출은 모두 `/api/...` 상대 경로를 사용한다.
- Vite 개발 서버는 `9090`에서 실행되며 `/api`를 `http://localhost:8080`으로 프록시한다.
- Spring Boot는 전역 CORS에서 `http://localhost:9090`을 허용한다.

## 취약점 매핑

| 번호 | 패턴 | 엔드포인트 | 구현 위치 | 학습 신호 |
|---:|---|---|---|---|
| 1 | Blind SQL Injection | `GET /api/search?q=` | `AppraisalController.search` | 사용자 입력을 SQL 문자열에 직접 연결하고 검색 결과 수 및 `authenticSignal` 차이를 반환 |
| 2 | Time-based SQL Injection | `GET /api/search?q=SLEEP` | `AppraisalController.search` | `SLEEP` 토큰 감지 시 지연 응답을 발생 |
| 3 | Command Injection | `POST /api/transform` | `AppraisalController.transform` | 이미지명과 변환 옵션을 쉘 명령어 문자열로 합성 후 실행 |
| 4 | Path Traversal | `GET /api/files?path=` | `AppraisalController.file` | `../` 포함 경로를 정규화만 하고 기준 디렉터리 검증 없이 읽음 |
| 5 | XXE | `POST /api/metadata/xml` | `AppraisalController.parseXml` | 외부 엔티티와 DOCTYPE을 허용한 XML 파서 사용 |
| 6 | SSRF | `POST /api/external-image` | `AppraisalController.externalImage` | 서버가 사용자 URL을 직접 열어 내부망 URL 접근 가능 |
| 7 | IDOR/BOLA | `GET /api/reports/{id}` | `AppraisalController.report` | `user` 파라미터와 보고서 소유권 검증 없이 ID만으로 조회 |
| 8 | BFLA | `POST /api/admin/reindex` | `AppraisalController.adminReindex` | 관리자 기능에 역할 검증이 없음 |
| 9 | Reflected XSS | `GET /api/echo?frame=` | `AppraisalController.echo` | 입력값을 HTML 문자열로 그대로 반사 |
| 10 | Stored XSS | `POST /api/comments` 및 `GET /api/comments` | `AppraisalController.addComment`, React `dangerouslySetInnerHTML` | 스크립트 가능 마크업을 DB에 저장하고 브라우저에서 그대로 렌더링 |
| 11 | 인증 및 세션 관리 결함 | `POST /api/auth/login` | `AppraisalController.login`, `application.yml` | 1글자 비밀번호 허용, 잠금 없음, 30일 세션 |

## UI 훈련 포인트

- 실시간 감정 스캔 애니메이션: 중앙 갤러리 뷰어의 스캔 라인과 신뢰도 링.
- AI 감정 신뢰도 차트: 작품별 `confidence` 값을 원형 차트로 표시.
- 보안 이벤트 로그 터미널: 취약 API 호출 시 `SecurityEventService`에 기록된 벡터와 메시지를 표시.
- 취약점 시뮬레이션 콘솔: SQLi, Time SQLi, Command Injection, Path Traversal, XXE, SSRF, IDOR, BFLA, XSS, Auth 결함을 버튼으로 실행.

## 샘플 페이로드

```text
Blind SQLi: ' OR '1'='1
Time SQLi: Nocturne' OR SLEEP(2)--
Command Injection: operation = resize; whoami
Path Traversal: ../pom.xml
XXE: <!DOCTYPE art [ <!ENTITY xxe SYSTEM "file:///etc/hostname"> ]><art>&xxe;</art>
SSRF: http://localhost:9090/api/security-events
Reflected XSS: <svg onload=alert("reflected-xss")></svg>
Stored XSS: <img src=x onerror=alert("stored-xss")>
Weak Auth: username=guest, password=1
```

## 실행

```bash
docker compose up --build
```

접속: `http://localhost:9090`
