# Intentional Bug Catalog — error-site-v20

- Theme: **공유오피스 예약**
- Archetype: **Booking**
- Layout / DOM: `stepper-form` / `multi-step-form`

각 항목의 `source_id`, oracle, evidence는 팀 제공 `security_error_reward_policy.csv`에서 가져왔고, endpoint/UI는 이 사이트 구조에 맞게 매핑했습니다.

## ERROR-SITE-V20-BUG-01 — IDOR

- **Source ID:** `SEC-017`
- **Source error name:** 수평적 권한 상승 (wishlist)
- **Reproduction scope:** `API_ONLY`
- **Site trigger / endpoint:** `GET /api/private-records/:id`
- **Safe fixture:** `jwas-safe-017`
- **Expected normal behavior:** 다른 사용자의 자원은 403 또는 404로 차단되어야 한다.
- **Intentional buggy behavior:** owner 검증 없이 ID만으로 다른 사용자의 자원을 200으로 반환한다.
- **Oracle required:** 200 응답이며 owner가 B이면 취약
- **Evidence required:** `role;request;status;response_owner`
- **Original target action:** 사용자 A로 사용자 B의 wishlist ID 조회
- **Reference:** OWASP Top 10 2021 A01 Broken Access Control; OWASP API1/API5:2023

## ERROR-SITE-V20-BUG-02 — permission-drift

- **Source ID:** `SEC-075`
- **Source error name:** 권한 변경 후 이전 권한 재사용 (reviews)
- **Reproduction scope:** `API_ONLY`
- **Site trigger / endpoint:** `POST /api/admin/demote-self → GET /api/admin/privileged`
- **Safe fixture:** `jwas-safe-075`
- **Expected normal behavior:** 권한 회수 직후 기존 세션도 새 권한을 반영해야 한다.
- **Intentional buggy behavior:** DB 권한을 회수해도 세션에 캐시된 이전 관리자 권한이 계속 사용된다.
- **Oracle required:** 회수 뒤 보호 자원 접근이 성공하면 취약
- **Evidence required:** `role_diff;session;status;access_log`
- **Original target action:** 권한 회수 후 기존 세션으로 reviews 재호출
- **Reference:** OWASP Top 10 2021 A01 Broken Access Control; OWASP API1/API5:2023

## ERROR-SITE-V20-BUG-03 — stored-xss

- **Source ID:** `SEC-139`
- **Source error name:** 저장형 XSS (공지사항)
- **Reproduction scope:** `UI`
- **Site trigger / endpoint:** `POST /api/notes → GET /api/notes`
- **Safe fixture:** `jwas-safe-139`
- **Expected normal behavior:** 저장된 사용자 입력은 재조회 후에도 실행 가능한 HTML로 해석되지 않아야 한다.
- **Intentional buggy behavior:** 저장된 note 내용을 프론트엔드가 dangerouslySetInnerHTML로 재렌더링한다.
- **Oracle required:** 저장 marker가 executable DOM sink에 삽입되면 취약
- **Evidence required:** `input;write_response;read_response;dom_sink`
- **Original target action:** 공지사항에 안전 marker 저장 후 재조회
- **Reference:** OWASP Top 10 2021 A03 Injection; OWASP WSTG Input Validation

## ERROR-SITE-V20-BUG-04 — sql-injection

- **Source ID:** `SEC-156`
- **Source error name:** SQL 인젝션 조건 분기 (댓글 입력)
- **Reproduction scope:** `API_ONLY`
- **Site trigger / endpoint:** `GET /api/search?q=<condition>`
- **Safe fixture:** `jwas-safe-156`
- **Expected normal behavior:** 검색 조건은 파라미터 바인딩되어 입력이 SQL 구조를 변경하지 않아야 한다.
- **Intentional buggy behavior:** 검색어를 SQL 문자열에 직접 결합하여 조건식이 쿼리 구조에 영향을 줄 수 있다.
- **Oracle required:** row count 또는 응답 집합이 비정상적으로 변하면 취약
- **Evidence required:** `input;request;status;row_count_diff`
- **Original target action:** 정상 검색과 댓글 입력 안전 조건 marker 결과 비교
- **Reference:** OWASP Top 10 2021 A03 Injection; OWASP WSTG Input Validation

## ERROR-SITE-V20-BUG-05 — system-info-disclosure

- **Source ID:** `SEC-196`
- **Source error name:** 시스템 정보 노출 (페이지네이션)
- **Reproduction scope:** `API_ONLY`
- **Site trigger / endpoint:** `POST /api/parse`
- **Safe fixture:** `jwas-safe-196`
- **Expected normal behavior:** 오류 응답은 내부 경로·SQL·stack trace를 노출하지 않아야 한다.
- **Intentional buggy behavior:** 형식 오류 요청에 내부 파일 경로와 SQL/stack 힌트를 포함한 디버그 정보를 반환한다.
- **Oracle required:** stack trace SQL 또는 내부 경로가 노출되면 취약
- **Evidence required:** `request;status;response;secret_pattern`
- **Original target action:** 페이지네이션에 형식 오류 안전 입력 전송
- **Reference:** OWASP Top 10 2021 A03 Injection; OWASP WSTG Input Validation

## ERROR-SITE-V20-BUG-06 — logout-reuse

- **Source ID:** `SEC-267`
- **Source error name:** 로그아웃 토큰 재사용 (캘린더 제목)
- **Reproduction scope:** `API_ONLY`
- **Site trigger / endpoint:** `POST /api/auth/logout → protected API retry`
- **Safe fixture:** `jwas-safe-267`
- **Expected normal behavior:** 로그아웃된 토큰은 이후 보호 API 호출에 사용할 수 없어야 한다.
- **Intentional buggy behavior:** 로그아웃 응답은 성공하지만 서버 세션 Map에서 토큰을 제거하지 않는다.
- **Oracle required:** 로그아웃 뒤 기존 토큰으로 200이면 취약
- **Evidence required:** `token_hash;logout_status;retry_status`
- **Original target action:** 로그아웃 후 캘린더 제목 보호 API 재호출
- **Reference:** OWASP Top 10 2021 A02/A07; OWASP WSTG Authentication

## ERROR-SITE-V20-BUG-07 — idempotency

- **Source ID:** `SEC-338`
- **Source error name:** 멱등성 키 누락 (장바구니)
- **Reproduction scope:** `API_ONLY`
- **Site trigger / endpoint:** `POST /api/transactions (same Idempotency-Key twice)`
- **Safe fixture:** `jwas-safe-338`
- **Expected normal behavior:** 동일 idempotency key의 재시도는 동일 거래 결과를 반환해야 한다.
- **Intentional buggy behavior:** 같은 Idempotency-Key로 요청해도 매번 새 거래를 생성한다.
- **Oracle required:** 서로 다른 거래를 생성하면 취약
- **Evidence required:** `idempotency_key;request_sequence;transaction_ids`
- **Original target action:** 동일 key로 장바구니 요청 두 번 전송
- **Reference:** OWASP Top 10 2021 A04 Insecure Design; OWASP API6:2023

## ERROR-SITE-V20-BUG-08 — async-no-feedback

- **Source ID:** `SEC-365`
- **Source error name:** 비동기 pending 피드백 부재 (파일 설명)
- **Reproduction scope:** `UI`
- **Site trigger / endpoint:** `POST /api/slow-action`
- **Safe fixture:** `jwas-safe-365`
- **Expected normal behavior:** 지연 요청 동안 로딩/진행/취소 등 사용자 피드백이 제공되어야 한다.
- **Intentional buggy behavior:** 약 4.5초 pending 동안 버튼 비활성화·spinner·취소 UI가 전혀 나타나지 않는다.
- **Oracle required:** pending인데 UI 피드백과 취소 경로가 없으면 취약
- **Evidence required:** `request;elapsed;api_state;dom_feedback`
- **Original target action:** 파일 설명를 고정 deadline까지 관찰
- **Reference:** OWASP API4:2023 Unrestricted Resource Consumption; OWASP WSTG
