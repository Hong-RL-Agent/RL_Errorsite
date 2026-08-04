# System Information Disclosure Vulnerability Report (site019)

본 문서에는 NeonFit 피트니스 플랫폼(`site019`)의 의도된 System Information Disclosure(시스템 정보 노출) 취약점 정보(site019-bug01 ~ site019-bug11)가 기재되어 있습니다.

---

### 1. site019-bug01 (SEC-190)
- **type**: system-info-disclosure
- **발생 API**: `GET /api/programs?filter=`
- **발생 조건**: 필터링 검색 조건에 'error' 문자열이 포함될 경우
- **기대되는 정상 동작**: 일반적인 오류 메시지만 반환한다.
- **의도된 취약 동작**: 응답 본문에 Stack Trace, SQL Error, Internal Path, Express Error가 노출된다.
- **탐지 기준**: 응답에서 내부 구현 정보(Stack, SQL error 등)가 확인되면 취약하다.

---

### 2. site019-bug02 (SEC-191)
- **type**: system-info-disclosure
- **발생 API**: `POST /api/login`
- **발생 조건**: 로그인 요청 시 username이 'error'로 입력될 경우
- **기대되는 정상 동작**: 일반적인 오류 메시지만 반환한다.
- **의도된 취약 동작**: 로그인 인증 모듈의 NullPointerException 예외 Stack Trace가 반환된다.
- **탐지 기준**: 응답에서 내부 구현 정보가 확인되면 취약하다.

---

### 3. site019-bug03 (SEC-192)
- **type**: system-info-disclosure
- **발생 API**: `POST /api/register`
- **발생 조건**: 가입 요청 시 username이 'error'로 입력될 경우
- **기대되는 정상 동작**: 일반적인 오류 메시지만 반환한다.
- **의도된 취약 동작**: 가입 절차 로그 기록 내부 File IO Exception 및 파일 경로가 응답에 출력된다.
- **탐지 기준**: 응답에서 내부 구현 정보가 확인되면 취약하다.

---

### 4. site019-bug04 (SEC-193)
- **type**: system-info-disclosure
- **발생 API**: `POST /api/profile/address`
- **발생 조건**: 주소지 변경 요청 시 address가 'error'로 입력될 경우
- **기대되는 정상 동작**: 일반적인 오류 메시지만 반환한다.
- **의도된 취약 동작**: Express Route Handler Exception 및 스택 정보가 반환된다.
- **탐지 기준**: 응답에서 내부 구현 정보가 확인되면 취약하다.

---

### 5. site019-bug05 (SEC-194)
- **type**: system-info-disclosure
- **발생 API**: `POST /api/coupons`
- **발생 조건**: 쿠폰 등록 요청 시 code가 'error'로 입력될 경우
- **기대되는 정상 동작**: 일반적인 오류 메시지만 반환한다.
- **의도된 취약 동작**: SQLGrammarException 예외와 상세 매핑 쿼리 구문 오류가 노출된다.
- **탐지 기준**: 응답에서 내부 구현 정보가 확인되면 취약하다.

---

### 6. site019-bug06 (SEC-195)
- **type**: system-info-disclosure
- **발생 API**: `GET /api/programs?sort=`
- **발생 조건**: 정렬 파라미터에 'error' 문자열이 포함될 경우
- **기대되는 정상 동작**: 일반적인 오류 메시지만 반환한다.
- **의도된 취약 동작**: SQLException 컬럼 정렬 범위 예외와 원시 쿼리 메시지가 응답에 출력된다.
- **탐지 기준**: 응답에서 내부 구현 정보가 확인되면 취약하다.

---

### 7. site019-bug07 (SEC-196)
- **type**: system-info-disclosure
- **발생 API**: `GET /api/programs?page=`
- **발생 조건**: 페이지 번호 파라미터에 'error' 문자열이 포함될 경우
- **기대되는 정상 동작**: 일반적인 오류 메시지만 반환한다.
- **의도된 취약 동작**: 페이지 번호 계산 오류 PaginationException 및 오프셋 에러 스택이 출력된다.
- **탐지 기준**: 응답에서 내부 구현 정보가 확인되면 취약하다.

---

### 8. site019-bug08 (SEC-197)
- **type**: system-info-disclosure
- **발생 API**: `POST /api/files/upload`
- **발생 조건**: 파일 등록 시 name이 'error'로 기입될 경우
- **기대되는 정상 동작**: 일반적인 오류 메시지만 반환한다.
- **의도된 취약 동작**: 파일 I/O 오류 FileUploadException 및 임시 업로드 폴더에 대한 상세 스택 트레이스가 출력된다.
- **탐지 기준**: 응답에서 내부 구현 정보가 확인되면 취약하다.

---

### 9. site019-bug09 (SEC-198)
- **type**: system-info-disclosure
- **발생 API**: `POST /api/chat`
- **발생 조건**: 대화 메시지 기입 시 text가 'error'로 입력될 경우
- **기대되는 정상 동작**: 일반적인 오류 메시지만 반환한다.
- **의도된 취약 동작**: NodeRuntimeModuleException 런타임 스레드 풀 오류 트레이스가 반환된다.
- **탐지 기준**: 응답에서 내부 구현 정보가 확인되면 취약하다.

---

### 10. site019-bug10 (SEC-199)
- **type**: system-info-disclosure
- **발생 API**: `GET /api/notices`
- **발생 조건**: 공지사항 검색 옵션 중 keyword가 'error'로 입력될 경우
- **기대되는 정상 동작**: 일반적인 오류 메시지만 반환한다.
- **의도된 취약 동작**: notice 조회 루틴의 DB 컬럼 매칭 오류 SQLException 구문 분석 에러가 반환된다.
- **탐지 기준**: 응답에서 내부 구현 정보가 확인되면 취약하다.

---

### 11. site019-bug11 (SEC-200)
- **type**: system-info-disclosure
- **발생 API**: `POST /api/reviews`
- **발생 조건**: 리뷰 코멘트 본문 text가 'error'로 전달될 경우
- **기대되는 정상 동작**: 일반적인 오류 메시지만 반환한다.
- **의도된 취약 동작**: 리뷰 디렉토리 설정 경로 PathDisclosureException이 반환된다.
- **탐지 기준**: 응답에서 내부 구현 정보가 확인되면 취약하다.
