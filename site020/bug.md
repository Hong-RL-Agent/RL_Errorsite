# System Information Disclosure Vulnerability Report (site020)

본 문서에는 Nexus Events 컨퍼런스 & 행사 관리 플랫폼(`site020`)의 의도된 System Information Disclosure(시스템 정보 노출) 취약점 정보(site020-bug01 ~ site020-bug10)가 기재되어 있습니다.

---

### 1. site020-bug01 (SEC-201)
- **type**: system-info-disclosure
- **발생 API**:
  - `POST /api/tags`
  - `GET /api/tags`
- **발생 조건**: 태그 입력란에 형식 오류 안전 입력(예: 특수문자가 섞인 잘못된 태그 포맷이나 비정상적인 JSON 구조 등)을 전송한다.
- **기대되는 정상 동작**: 입력 형식이 잘못되었다는 일반적인 클라이언트 친화적 에러 메시지(예: "유효하지 않은 태그 형식입니다.")만을 반환한다.
- **의도된 취약 동작**: 응답에 상세한 Internal File Path, Node/Express Stack Trace 및 SQL Error 형태의 내부 구현 정보가 포함된다.
- **탐지 기준**: 형식 오류 입력 전송 시 응답 데이터에서 Stack Trace, SQL Syntax, 혹은 내부 디렉토리 경로 정보가 확인되면 취약하다.

---

### 2. site020-bug02 (SEC-202)
- **type**: system-info-disclosure
- **발생 API**:
  - `POST /api/invitations`
  - `GET /api/invitations`
- **발생 조건**: 잘못된 이메일 또는 초대 코드 형식을 전송한다.
- **기대되는 정상 동작**: 일반적인 유효성 검증 오류 메시지만 반환한다.
- **의도된 취약 동작**: 백엔드의 메일 템플릿 생성기 모듈 내부 스택 트레이스 및 경로 정보가 응답에 노출된다.
- **탐지 기준**: 응답 바디에 `node_modules` 경로나 `TypeError: Cannot read properties of undefined` 등 Express 에러 세부 사항이 포함되면 취약하다.

---

### 3. site020-bug03 (SEC-203)
- **type**: system-info-disclosure
- **발생 API**:
  - `POST /api/reservations/note`
  - `GET /api/reservations`
- **발생 조건**: 참가자 메모 등록 시 허용 범위를 넘어서는 대용량 바이트 혹은 형식 오류 입력을 전송한다.
- **기대되는 정상 동작**: "메모의 내용이 너무 깁니다" 등 규격화된 에러를 반환한다.
- **의도된 취약 동작**: DB 쿼리 파서의 오류 정보 및 가상 SQL 구문 구조가 상세하게 포함된 에러 로그가 응답으로 반환된다.
- **탐지 기준**: 응답 메시지에 `sqlite3.DatabaseError` 또는 `pg_query` 등 가상의 데이터베이스 스키마 및 문법 에러와 스택 트레이스가 포함되면 취약하다.

---

### 4. site020-bug04 (SEC-204)
- **type**: system-info-disclosure
- **발생 API**:
  - `POST /api/refunds`
  - `GET /api/refunds`
- **발생 조건**: 환불 신청 시 금액을 숫자가 아닌 값으로 전송하거나 비정상적인 환불 예약 번호 형식을 전송한다.
- **기대되는 정상 동작**: "환불 처리 중 오류가 발생했습니다. 금액을 확인해주세요." 와 같은 안전한 일반 에러를 리턴한다.
- **의도된 취약 동작**: 백엔드 환불 트랜잭션 함수(`processRefundTransaction()`) 내부 연산 도중 발생한 예외 스택과 소스 파일명이 그대로 노출된다.
- **탐지 기준**: 응답 본문에 파일 경로(`server.js:145` 등)와 `TransactionException` 스택 구조가 노출되면 취약하다.

---

### 5. site020-bug05 (SEC-205)
- **type**: system-info-disclosure
- **발생 API**:
  - `GET /api/search/suggestions`
- **발생 조건**: 검색어 자동완성 쿼리 파라미터 `q`에 정의되지 않은 비정상적 타입이나 빈 배열 형태 등의 파라미터를 전송한다.
- **기대되는 정상 동작**: 검색어가 유효하지 않음을 나타내는 일반 오류를 반환하거나 빈 결과를 반환한다.
- **의도된 취약 동작**: 내부 검색 모듈의 정규식 컴파일 오류 스택이나 쿼리 프로세서의 Node.js 내부 스레드 정보가 반환된다.
- **탐지 기준**: 응답 결과에 `SyntaxError: Invalid regular expression` 등과 함께 백엔드 JS 파일 경로 및 Node 엔진 오류 정보가 표시되면 취약하다.

---

### 6. site020-bug06 (SEC-206)
- **type**: system-info-disclosure
- **발생 API**:
  - `POST /api/notifications`
  - `GET /api/notifications`
- **발생 조건**: 알림 수신 대상 또는 채널 포맷에 잘못된 형식을 작성하여 전송한다.
- **기대되는 정상 동작**: 알림 채널 에러나 대상 부적합 오류 메시지만 출력한다.
- **의도된 취약 동작**: 알림 디스패처 서비스 컴포넌트의 클래스 메서드 호출 스택과 서버 환경 변수 중 일부 디버깅 덤프가 노출된다.
- **탐지 기준**: 응답 에러 내역에 내부 메서드 명세 및 환경 디렉토리 스택이 포함되면 취약하다.

---

### 7. site020-bug07 (SEC-207)
- **type**: system-info-disclosure
- **발생 API**:
  - `POST /api/calendar`
  - `GET /api/calendar`
- **발생 조건**: 날짜 입력에 잘못된 날짜 경계값이나 포맷이 다른 값을 전송한다.
- **기대되는 정상 동작**: "올바른 날짜를 선택해주세요." 등 날짜 유효성 실패를 알린다.
- **의도된 취약 동작**: Date 파싱 라이브러리 및 내부 일정 검증 루틴의 stack trace가 에러 메시지로 반환된다.
- **탐지 기준**: 응답에서 `RangeError: Invalid time value`와 함께 `server.js` 내의 달력 계산 함수 내부 흐름 및 호출 스택이 출력되면 취약하다.

---

### 8. site020-bug08 (SEC-208)
- **type**: system-info-disclosure
- **발생 API**:
  - `POST /api/reports/filter`
  - `GET /api/reports/filter`
- **발생 조건**: 운영 리포트 필터링 조건 중 연도(Year)나 정렬값에 음수, 또는 불가능한 조건 타입을 입력하여 전송한다.
- **기대되는 정상 동작**: "리포트 조회 필터가 유효하지 않습니다." 등 보안 경고나 일반 실패 안내를 리턴한다.
- **의도된 취약 동작**: 가상 집계 엔진의 파이프라인 컴파일러 예외 정보와 DB 컬럼 구조 정보가 그대로 반환된다.
- **탐지 기준**: `AggregateError` 혹은 `SQLSyntaxErrorException` 등 백엔드 가상 엔진 소스 라인과 테이블 스키마가 응답에 출력되면 취약하다.

---

### 9. site020-bug09 (SEC-209)
- **type**: system-info-disclosure
- **발생 API**:
  - `POST /api/import/csv`
  - `GET /api/import/history`
- **발생 조건**: CSV 파일 업로드 요청에 손상된 바이너리 데이터나 형식이 다른 비정상 구조의 데이터를 전송한다.
- **기대되는 정상 동작**: "유효하지 않은 CSV 파일 포맷입니다." 에러를 반환한다.
- **의도된 취약 동작**: CSV 파서 모듈의 스트림 에러, 버퍼 에러 및 내부 임시 저장소 디렉토리(Temp Path)의 절대 경로 정보가 노출된다.
- **탐지 기준**: `C:\Users\...` 또는 `/var/tmp/upload_...` 와 같은 실제 서버의 내부 디렉토리 경로와 파일 파싱 라이브러리의 스택 예외가 노출되면 취약하다.

---

### 10. site020-bug10 (SEC-210)
- **type**: system-info-disclosure
- **발생 API**:
  - `POST /api/query`
  - `GET /api/query/history`
- **발생 조건**: API 쿼리 콘솔에서 안전하지 않거나 포맷이 깨진 쿼리 명세 문자열을 전송한다.
- **기대되는 정상 동작**: "구문 오류가 발생했습니다." 등 표준 안내 문구만 노출한다.
- **의도된 취약 동작**: ORM/DB 프레임워크 스택 트레이스 및 데이터베이스 드라이버 연결 스트링 정보(커넥션 정보)가 에러 본문에 나타난다.
- **탐지 기준**: 응답 결과에 가상 데이터베이스 구조, 세부 커넥션 인스턴스 변수 명세 및 Stack Trace가 노출되면 취약하다.
