# Intentional Bug Catalog — error-site-v34

- Theme: **경비/지출 관리**
- Archetype: **Dashboard**
- Layout / DOM: `split-detail` / `master-detail`

각 항목의 `source_id`, oracle, evidence는 팀 제공 `security_error_reward_policy.csv`에서 가져왔고, endpoint/UI는 이 사이트 구조에 맞게 매핑했습니다.

## ERROR-SITE-V34-BUG-01 — IDOR

- **Source ID:** `SEC-028`
- **Source error name:** 수평적 권한 상승 (api-keys)
- **Reproduction scope:** `API_ONLY`
- **Site trigger / endpoint:** `GET /api/private-records/:id`
- **Safe fixture:** `jwas-safe-028`
- **Expected normal behavior:** 다른 사용자의 자원은 403 또는 404로 차단되어야 한다.
- **Intentional buggy behavior:** owner 검증 없이 ID만으로 다른 사용자의 자원을 200으로 반환한다.
- **Oracle required:** 200 응답이며 owner가 B이면 취약
- **Evidence required:** `role;request;status;response_owner`
- **Original target action:** 사용자 A로 사용자 B의 api-keys ID 조회
- **Reference:** OWASP Top 10 2021 A01 Broken Access Control; OWASP API1/API5:2023

## ERROR-SITE-V34-BUG-02 — permission-drift

- **Source ID:** `SEC-089`
- **Source error name:** 권한 변경 후 이전 권한 재사용 (webhooks)
- **Reproduction scope:** `API_ONLY`
- **Site trigger / endpoint:** `POST /api/admin/demote-self → GET /api/admin/privileged`
- **Safe fixture:** `jwas-safe-089`
- **Expected normal behavior:** 권한 회수 직후 기존 세션도 새 권한을 반영해야 한다.
- **Intentional buggy behavior:** DB 권한을 회수해도 세션에 캐시된 이전 관리자 권한이 계속 사용된다.
- **Oracle required:** 회수 뒤 보호 자원 접근이 성공하면 취약
- **Evidence required:** `role_diff;session;status;access_log`
- **Original target action:** 권한 회수 후 기존 세션으로 webhooks 재호출
- **Reference:** OWASP Top 10 2021 A01 Broken Access Control; OWASP API1/API5:2023

## ERROR-SITE-V34-BUG-03 — reflected-xss

- **Source ID:** `SEC-096`
- **Source error name:** 반사형 XSS (댓글 입력)
- **Reproduction scope:** `UI`
- **Site trigger / endpoint:** `GET /api/echo?q=<marker>`
- **Safe fixture:** `jwas-safe-096`
- **Expected normal behavior:** 사용자 입력은 HTML 실행 문맥이 아닌 텍스트로 안전하게 표시되어야 한다.
- **Intentional buggy behavior:** 응답의 사용자 입력을 프론트엔드가 dangerouslySetInnerHTML로 렌더링한다.
- **Oracle required:** marker가 executable DOM sink에 삽입되면 취약
- **Evidence required:** `input;request;response;dom_sink`
- **Original target action:** 댓글 입력에 안전 marker 입력
- **Reference:** OWASP Top 10 2021 A03 Injection; OWASP WSTG Input Validation

## ERROR-SITE-V34-BUG-04 — stored-xss

- **Source ID:** `SEC-146`
- **Source error name:** 저장형 XSS (알림 제목)
- **Reproduction scope:** `UI`
- **Site trigger / endpoint:** `POST /api/notes → GET /api/notes`
- **Safe fixture:** `jwas-safe-146`
- **Expected normal behavior:** 저장된 사용자 입력은 재조회 후에도 실행 가능한 HTML로 해석되지 않아야 한다.
- **Intentional buggy behavior:** 저장된 note 내용을 프론트엔드가 dangerouslySetInnerHTML로 재렌더링한다.
- **Oracle required:** 저장 marker가 executable DOM sink에 삽입되면 취약
- **Evidence required:** `input;write_response;read_response;dom_sink`
- **Original target action:** 알림 제목에 안전 marker 저장 후 재조회
- **Reference:** OWASP Top 10 2021 A03 Injection; OWASP WSTG Input Validation

## ERROR-SITE-V34-BUG-05 — system-info-disclosure

- **Source ID:** `SEC-210`
- **Source error name:** 시스템 정보 노출 (API query)
- **Reproduction scope:** `API_ONLY`
- **Site trigger / endpoint:** `POST /api/parse`
- **Safe fixture:** `jwas-safe-210`
- **Expected normal behavior:** 오류 응답은 내부 경로·SQL·stack trace를 노출하지 않아야 한다.
- **Intentional buggy behavior:** 형식 오류 요청에 내부 파일 경로와 SQL/stack 힌트를 포함한 디버그 정보를 반환한다.
- **Oracle required:** stack trace SQL 또는 내부 경로가 노출되면 취약
- **Evidence required:** `request;status;response;secret_pattern`
- **Original target action:** API query에 형식 오류 안전 입력 전송
- **Reference:** OWASP Top 10 2021 A03 Injection; OWASP WSTG Input Validation

## ERROR-SITE-V34-BUG-06 — security-headers

- **Source ID:** `SEC-288`
- **Source error name:** 보안 헤더 누락 (채팅 입력)
- **Reproduction scope:** `API_ONLY`
- **Site trigger / endpoint:** `GET /api/header-check`
- **Safe fixture:** `jwas-safe-288`
- **Expected normal behavior:** 필수 보안 응답 헤더 정책을 적용해야 한다.
- **Intentional buggy behavior:** header-check 응답에서 CSP/HSTS/X-Content-Type-Options가 의도적으로 누락된다.
- **Oracle required:** CSP HSTS X-Content-Type-Options 중 누락이 있으면 취약
- **Evidence required:** `url;status;response_headers;policy`
- **Original target action:** 채팅 입력 응답 헤더 검사
- **Reference:** OWASP Top 10 2021 A02/A07; OWASP WSTG Authentication

## ERROR-SITE-V34-BUG-07 — price-tampering

- **Source ID:** `SEC-305`
- **Source error name:** 클라이언트 금액 변조 (파일 설명)
- **Reproduction scope:** `UI_TRIGGER_API_UI_VERIFY`
- **Site trigger / endpoint:** `POST /api/checkout`
- **Safe fixture:** `jwas-safe-305`
- **Expected normal behavior:** 결제 금액은 서버가 장바구니/상품 데이터로 재계산해야 한다.
- **Intentional buggy behavior:** checkout이 clientTotal을 검증하지 않고 주문 금액으로 저장한다.
- **Oracle required:** 서버 subtotal과 결제 금액이 다른데 승인되면 취약
- **Evidence required:** `cart_state;request;response;server_total`
- **Original target action:** 파일 설명 결제 금액을 fixture 값으로 변경
- **Reference:** OWASP Top 10 2021 A04 Insecure Design; OWASP API6:2023

## ERROR-SITE-V34-BUG-08 — idempotency

- **Source ID:** `SEC-345`
- **Source error name:** 멱등성 키 누락 (정렬 파라미터)
- **Reproduction scope:** `API_ONLY`
- **Site trigger / endpoint:** `POST /api/transactions (same Idempotency-Key twice)`
- **Safe fixture:** `jwas-safe-345`
- **Expected normal behavior:** 동일 idempotency key의 재시도는 동일 거래 결과를 반환해야 한다.
- **Intentional buggy behavior:** 같은 Idempotency-Key로 요청해도 매번 새 거래를 생성한다.
- **Oracle required:** 서로 다른 거래를 생성하면 취약
- **Evidence required:** `idempotency_key;request_sequence;transaction_ids`
- **Original target action:** 동일 key로 정렬 파라미터 요청 두 번 전송
- **Reference:** OWASP Top 10 2021 A04 Insecure Design; OWASP API6:2023
