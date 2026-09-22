# Intentional Bug Catalog — error-site-v03

- Theme: **친환경 식품몰**
- Archetype: **Commerce**
- Layout / DOM: `sidebar-table` / `table-row-detail`

각 항목의 `source_id`, oracle, evidence는 팀 제공 `security_error_reward_policy.csv`에서 가져왔고, endpoint/UI는 이 사이트 구조에 맞게 매핑했습니다.

## ERROR-SITE-V03-BUG-01 — IDOR

- **Source ID:** `SEC-003`
- **Source error name:** 수평적 권한 상승 (reports)
- **Reproduction scope:** `API_ONLY`
- **Site trigger / endpoint:** `GET /api/private-records/:id`
- **Safe fixture:** `jwas-safe-003`
- **Expected normal behavior:** 다른 사용자의 자원은 403 또는 404로 차단되어야 한다.
- **Intentional buggy behavior:** owner 검증 없이 ID만으로 다른 사용자의 자원을 200으로 반환한다.
- **Oracle required:** 200 응답이며 owner가 B이면 취약
- **Evidence required:** `role;request;status;response_owner`
- **Original target action:** 사용자 A로 사용자 B의 reports ID 조회
- **Reference:** OWASP Top 10 2021 A01 Broken Access Control; OWASP API1/API5:2023

## ERROR-SITE-V03-BUG-02 — vertical-privilege-escalation

- **Source ID:** `SEC-045`
- **Source error name:** 관리자 API 권한 우회 (reviews)
- **Reproduction scope:** `API_ONLY`
- **Site trigger / endpoint:** `GET /api/admin/protected`
- **Safe fixture:** `jwas-safe-045`
- **Expected normal behavior:** 일반 사용자는 관리자 API에서 403을 받아야 한다.
- **Intentional buggy behavior:** 관리자 전용 경로가 일반 로그인 사용자에게도 200으로 열린다.
- **Oracle required:** 비관리자에게 200 및 보호 데이터가 반환되면 취약
- **Evidence required:** `role;endpoint;status;response_fields`
- **Original target action:** 일반 역할로 reviews 관리자 API 요청
- **Reference:** OWASP Top 10 2021 A01 Broken Access Control; OWASP API1/API5:2023

## ERROR-SITE-V03-BUG-03 — reflected-xss

- **Source ID:** `SEC-115`
- **Source error name:** 반사형 XSS (검색 제안)
- **Reproduction scope:** `UI`
- **Site trigger / endpoint:** `GET /api/echo?q=<marker>`
- **Safe fixture:** `jwas-safe-115`
- **Expected normal behavior:** 사용자 입력은 HTML 실행 문맥이 아닌 텍스트로 안전하게 표시되어야 한다.
- **Intentional buggy behavior:** 응답의 사용자 입력을 프론트엔드가 dangerouslySetInnerHTML로 렌더링한다.
- **Oracle required:** marker가 executable DOM sink에 삽입되면 취약
- **Evidence required:** `input;request;response;dom_sink`
- **Original target action:** 검색 제안에 안전 marker 입력
- **Reference:** OWASP Top 10 2021 A03 Injection; OWASP WSTG Input Validation

## ERROR-SITE-V03-BUG-04 — sql-injection

- **Source ID:** `SEC-179`
- **Source error name:** SQL 인젝션 조건 분기 (CSV 업로드)
- **Reproduction scope:** `API_ONLY`
- **Site trigger / endpoint:** `GET /api/search?q=<condition>`
- **Safe fixture:** `jwas-safe-179`
- **Expected normal behavior:** 검색 조건은 파라미터 바인딩되어 입력이 SQL 구조를 변경하지 않아야 한다.
- **Intentional buggy behavior:** 검색어를 SQL 문자열에 직접 결합하여 조건식이 쿼리 구조에 영향을 줄 수 있다.
- **Oracle required:** row count 또는 응답 집합이 비정상적으로 변하면 취약
- **Evidence required:** `input;request;status;row_count_diff`
- **Original target action:** 정상 검색과 CSV 업로드 안전 조건 marker 결과 비교
- **Reference:** OWASP Top 10 2021 A03 Injection; OWASP WSTG Input Validation

## ERROR-SITE-V03-BUG-05 — session-fixation

- **Source ID:** `SEC-213`
- **Source error name:** 로그인 후 세션 ID 미회전 (문의 폼)
- **Reproduction scope:** `API_ONLY`
- **Site trigger / endpoint:** `POST /api/auth/login with X-Session-Id`
- **Safe fixture:** `jwas-safe-213`
- **Expected normal behavior:** 로그인 성공 시 인증 전 세션 식별자와 다른 새 세션을 발급해야 한다.
- **Intentional buggy behavior:** X-Session-Id로 전달된 인증 전 세션 ID를 로그인 뒤에도 그대로 사용한다.
- **Oracle required:** 인증 후 session ID가 동일하면 취약
- **Evidence required:** `cookie_before;cookie_after;login_status`
- **Original target action:** 문의 폼 로그인 전후 session ID 비교
- **Reference:** OWASP Top 10 2021 A02/A07; OWASP WSTG Authentication

## ERROR-SITE-V03-BUG-06 — logout-reuse

- **Source ID:** `SEC-250`
- **Source error name:** 로그아웃 토큰 재사용 (필터 파라미터)
- **Reproduction scope:** `API_ONLY`
- **Site trigger / endpoint:** `POST /api/auth/logout → protected API retry`
- **Safe fixture:** `jwas-safe-250`
- **Expected normal behavior:** 로그아웃된 토큰은 이후 보호 API 호출에 사용할 수 없어야 한다.
- **Intentional buggy behavior:** 로그아웃 응답은 성공하지만 서버 세션 Map에서 토큰을 제거하지 않는다.
- **Oracle required:** 로그아웃 뒤 기존 토큰으로 200이면 취약
- **Evidence required:** `token_hash;logout_status;retry_status`
- **Original target action:** 로그아웃 후 필터 파라미터 보호 API 재호출
- **Reference:** OWASP Top 10 2021 A02/A07; OWASP WSTG Authentication

## ERROR-SITE-V03-BUG-07 — security-headers

- **Source ID:** `SEC-300`
- **Source error name:** 보안 헤더 누락 (API query)
- **Reproduction scope:** `API_ONLY`
- **Site trigger / endpoint:** `GET /api/header-check`
- **Safe fixture:** `jwas-safe-300`
- **Expected normal behavior:** 필수 보안 응답 헤더 정책을 적용해야 한다.
- **Intentional buggy behavior:** header-check 응답에서 CSP/HSTS/X-Content-Type-Options가 의도적으로 누락된다.
- **Oracle required:** CSP HSTS X-Content-Type-Options 중 누락이 있으면 취약
- **Evidence required:** `url;status;response_headers;policy`
- **Original target action:** API query 응답 헤더 검사
- **Reference:** OWASP Top 10 2021 A02/A07; OWASP WSTG Authentication

## ERROR-SITE-V03-BUG-08 — async-no-feedback

- **Source ID:** `SEC-378`
- **Source error name:** 비동기 pending 피드백 부재 (채팅 입력)
- **Reproduction scope:** `UI`
- **Site trigger / endpoint:** `POST /api/slow-action`
- **Safe fixture:** `jwas-safe-378`
- **Expected normal behavior:** 지연 요청 동안 로딩/진행/취소 등 사용자 피드백이 제공되어야 한다.
- **Intentional buggy behavior:** 약 4.5초 pending 동안 버튼 비활성화·spinner·취소 UI가 전혀 나타나지 않는다.
- **Oracle required:** pending인데 UI 피드백과 취소 경로가 없으면 취약
- **Evidence required:** `request;elapsed;api_state;dom_feedback`
- **Original target action:** 채팅 입력를 고정 deadline까지 관찰
- **Reference:** OWASP API4:2023 Unrestricted Resource Consumption; OWASP WSTG
