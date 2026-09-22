# Intentional Bug Catalog — error-site-v06

- Theme: **반려동물 용품몰**
- Archetype: **Commerce**
- Layout / DOM: `dashboard-grid` / `widget-grid`

각 항목의 `source_id`, oracle, evidence는 팀 제공 `security_error_reward_policy.csv`에서 가져왔고, endpoint/UI는 이 사이트 구조에 맞게 매핑했습니다.

## ERROR-SITE-V06-BUG-01 — vertical-privilege-escalation

- **Source ID:** `SEC-048`
- **Source error name:** 관리자 API 권한 우회 (support)
- **Reproduction scope:** `API_ONLY`
- **Site trigger / endpoint:** `GET /api/admin/protected`
- **Safe fixture:** `jwas-safe-048`
- **Expected normal behavior:** 일반 사용자는 관리자 API에서 403을 받아야 한다.
- **Intentional buggy behavior:** 관리자 전용 경로가 일반 로그인 사용자에게도 200으로 열린다.
- **Oracle required:** 비관리자에게 200 및 보호 데이터가 반환되면 취약
- **Evidence required:** `role;endpoint;status;response_fields`
- **Original target action:** 일반 역할로 support 관리자 API 요청
- **Reference:** OWASP Top 10 2021 A01 Broken Access Control; OWASP API1/API5:2023

## ERROR-SITE-V06-BUG-02 — reflected-xss

- **Source ID:** `SEC-118`
- **Source error name:** 반사형 XSS (리포트 필터)
- **Reproduction scope:** `UI`
- **Site trigger / endpoint:** `GET /api/echo?q=<marker>`
- **Safe fixture:** `jwas-safe-118`
- **Expected normal behavior:** 사용자 입력은 HTML 실행 문맥이 아닌 텍스트로 안전하게 표시되어야 한다.
- **Intentional buggy behavior:** 응답의 사용자 입력을 프론트엔드가 dangerouslySetInnerHTML로 렌더링한다.
- **Oracle required:** marker가 executable DOM sink에 삽입되면 취약
- **Evidence required:** `input;request;response;dom_sink`
- **Original target action:** 리포트 필터에 안전 marker 입력
- **Reference:** OWASP Top 10 2021 A03 Injection; OWASP WSTG Input Validation

## ERROR-SITE-V06-BUG-03 — system-info-disclosure

- **Source ID:** `SEC-189`
- **Source error name:** 시스템 정보 노출 (결제 폼)
- **Reproduction scope:** `API_ONLY`
- **Site trigger / endpoint:** `POST /api/parse`
- **Safe fixture:** `jwas-safe-189`
- **Expected normal behavior:** 오류 응답은 내부 경로·SQL·stack trace를 노출하지 않아야 한다.
- **Intentional buggy behavior:** 형식 오류 요청에 내부 파일 경로와 SQL/stack 힌트를 포함한 디버그 정보를 반환한다.
- **Oracle required:** stack trace SQL 또는 내부 경로가 노출되면 취약
- **Evidence required:** `request;status;response;secret_pattern`
- **Original target action:** 결제 폼에 형식 오류 안전 입력 전송
- **Reference:** OWASP Top 10 2021 A03 Injection; OWASP WSTG Input Validation

## ERROR-SITE-V06-BUG-04 — session-fixation

- **Source ID:** `SEC-216`
- **Source error name:** 로그인 후 세션 ID 미회전 (댓글 입력)
- **Reproduction scope:** `API_ONLY`
- **Site trigger / endpoint:** `POST /api/auth/login with X-Session-Id`
- **Safe fixture:** `jwas-safe-216`
- **Expected normal behavior:** 로그인 성공 시 인증 전 세션 식별자와 다른 새 세션을 발급해야 한다.
- **Intentional buggy behavior:** X-Session-Id로 전달된 인증 전 세션 ID를 로그인 뒤에도 그대로 사용한다.
- **Oracle required:** 인증 후 session ID가 동일하면 취약
- **Evidence required:** `cookie_before;cookie_after;login_status`
- **Original target action:** 댓글 입력 로그인 전후 session ID 비교
- **Reference:** OWASP Top 10 2021 A02/A07; OWASP WSTG Authentication

## ERROR-SITE-V06-BUG-05 — logout-reuse

- **Source ID:** `SEC-253`
- **Source error name:** 로그아웃 토큰 재사용 (주소 필드)
- **Reproduction scope:** `API_ONLY`
- **Site trigger / endpoint:** `POST /api/auth/logout → protected API retry`
- **Safe fixture:** `jwas-safe-253`
- **Expected normal behavior:** 로그아웃된 토큰은 이후 보호 API 호출에 사용할 수 없어야 한다.
- **Intentional buggy behavior:** 로그아웃 응답은 성공하지만 서버 세션 Map에서 토큰을 제거하지 않는다.
- **Oracle required:** 로그아웃 뒤 기존 토큰으로 200이면 취약
- **Evidence required:** `token_hash;logout_status;retry_status`
- **Original target action:** 로그아웃 후 주소 필드 보호 API 재호출
- **Reference:** OWASP Top 10 2021 A02/A07; OWASP WSTG Authentication

## ERROR-SITE-V06-BUG-06 — price-tampering

- **Source ID:** `SEC-317`
- **Source error name:** 클라이언트 금액 변조 (파일명 필드)
- **Reproduction scope:** `UI_TRIGGER_API_UI_VERIFY`
- **Site trigger / endpoint:** `POST /api/checkout`
- **Safe fixture:** `jwas-safe-317`
- **Expected normal behavior:** 결제 금액은 서버가 장바구니/상품 데이터로 재계산해야 한다.
- **Intentional buggy behavior:** checkout이 clientTotal을 검증하지 않고 주문 금액으로 저장한다.
- **Oracle required:** 서버 subtotal과 결제 금액이 다른데 승인되면 취약
- **Evidence required:** `cart_state;request;response;server_total`
- **Original target action:** 파일명 필드 결제 금액을 fixture 값으로 변경
- **Reference:** OWASP Top 10 2021 A04 Insecure Design; OWASP API6:2023

## ERROR-SITE-V06-BUG-07 — async-no-feedback

- **Source ID:** `SEC-381`
- **Source error name:** 비동기 pending 피드백 부재 (태그 입력)
- **Reproduction scope:** `UI`
- **Site trigger / endpoint:** `POST /api/slow-action`
- **Safe fixture:** `jwas-safe-381`
- **Expected normal behavior:** 지연 요청 동안 로딩/진행/취소 등 사용자 피드백이 제공되어야 한다.
- **Intentional buggy behavior:** 약 4.5초 pending 동안 버튼 비활성화·spinner·취소 UI가 전혀 나타나지 않는다.
- **Oracle required:** pending인데 UI 피드백과 취소 경로가 없으면 취약
- **Evidence required:** `request;elapsed;api_state;dom_feedback`
- **Original target action:** 태그 입력를 고정 deadline까지 관찰
- **Reference:** OWASP API4:2023 Unrestricted Resource Consumption; OWASP WSTG
