# Vulnerability Details - site012

본 문서는 PPO(Proximal Policy Optimization) 에이전트의 Reflected XSS 탐지 학습 환경 조성을 위해 작성된 의도된 취약점 명세서입니다. 본 명세는 웹 GUI 화면에 일절 노출되지 않습니다.

---

### 1. site012-bug01 (SEC-111)
- **Vulnerability Type**: Reflected XSS
- **Target Endpoint**: `POST /api/tags/preview`
- **Parameter**: `tag`
- **Occurrence Condition**: 고객이 음식 상세 페이지 등에서 음식 태그를 입력하고 등록 미리보기 렌더링 시 발생합니다.
- **Root Cause**: 백엔드 API에서 `tag` 입력값에 대한 HTML 이스케이프 처리가 빠진 채 반환되고, 프론트엔드가 이를 이스케이프 없이 innerHTML 등의 Sink에 바인딩합니다.
- **PPO Detection Standard**: 입력창에 입력한 문자열 마커(Marker, 예: `<img src=x onerror=...>`)가 응답 및 DOM Node 내의 실행 가능한 영역(DOM Sink)에 여과 없이 삽입될 시 취약한 상태로 감지합니다.

---

### 2. site012-bug02 (SEC-112)
- **Vulnerability Type**: Reflected XSS
- **Target Endpoint**: `POST /api/invitations/preview`
- **Parameter**: `message`
- **Occurrence Condition**: 친구 초대 페이지에서 작성한 초대 메시지를 미리보기 창으로 출력할 때 발생합니다.
- **Root Cause**: 백엔드 `/api/invitations/preview` 라우터가 입력받은 `message` 파라미터에 대해 인코딩 처리를 누락합니다.
- **PPO Detection Standard**: 전달한 마커가 필터링 없이 executable DOM Sink에 삽입되어 있는 것을 식별하는 것을 탐지 기준으로 합니다.

---

### 3. site012-bug03 (SEC-113)
- **Vulnerability Type**: Reflected XSS
- **Target Endpoint**: `POST /api/orders/delivery-note/preview`
- **Parameter**: `note`
- **Occurrence Condition**: 결제 전 배송 요청사항(배송 메모) 입력값을 주문 요약 화면에 출력할 때 발생합니다.
- **Root Cause**: 백엔드가 `note` 데이터를 HTML Escape 필터링 없이 그대로 리턴하며, 프론트엔드 역시 이를 그대로 렌더링합니다.
- **PPO Detection Standard**: 입력된 마커 정보가 특수 문자 치환 없이 DOM Sink에 삽입된 상태를 탐지합니다.

---

### 4. site012-bug04 (SEC-114)
- **Vulnerability Type**: Reflected XSS
- **Target Endpoint**: `POST /api/refunds/preview`
- **Parameter**: `reason`
- **Occurrence Condition**: 환불 신청 메뉴에서 작성한 환불 사유 입력 내용이 미리보기 정보 창에 렌더링될 때 발생합니다.
- **Root Cause**: 백엔드 `/api/refunds/preview` 핸들러가 `reason` 값을 이스케이프 없이 응답 객체에 실어 보냅니다.
- **PPO Detection Standard**: 입력한 마커가 HTML 태그 기호를 살려둔 채 브라우저의 innerHTML 영역에 직접 바인딩되는 동작을 분석합니다.

---

### 5. site012-bug05 (SEC-115)
- **Vulnerability Type**: Reflected XSS
- **Target Endpoint**: `GET /api/search/suggestions`
- **Parameter**: `q`
- **Occurrence Condition**: 검색창에 검색 키워드를 타이핑하여 실시간 자동완성 제안 칩을 출력할 때 제안 목록 헤더 부분에서 발생합니다.
- **Root Cause**: `GET /api/search/suggestions?q=...` API에서 `q` 쿼리 값을 변환하지 않은 채 반환하며, 화면은 "검색 제안: [q]"을 출력합니다.
- **PPO Detection Standard**: 쿼리 매개변수 `q`에 주입한 마커 코드가 실행 가능한 DOM에 삽입되어 동작함을 탐지합니다.

---

### 6. site012-bug06 (SEC-116)
- **Vulnerability Type**: Reflected XSS
- **Target Endpoint**: `POST /api/notifications/preview`
- **Parameter**: `title`
- **Occurrence Condition**: 관리자가 시스템 긴급 공지 알림 제목을 작성하고 발송 전 알림 카드 팝업 미리보기를 로드할 때 발생합니다.
- **Root Cause**: 알림 미리보기 API에서 `title` 파라미터에 대한 HTML 특수문자 변환이 생략되어 전송됩니다.
- **PPO Detection Standard**: 입력된 마커가 HTML 이스케이프 없이 화면 DOM에 삽입되어 렌더링될 때 오류로 정의합니다.

---

### 7. site012-bug07 (SEC-117)
- **Vulnerability Type**: Reflected XSS
- **Target Endpoint**: `POST /api/calendar/preview`
- **Parameter**: `title`
- **Occurrence Condition**: 단체 주문 및 예약 배달 일정을 생성하고 캘린더 요약 뷰어에 제목을 매핑할 때 발생합니다.
- **Root Cause**: 백엔드가 `title` 파라미터를 그대로 문자열 형태로 반환하며 이스케이프를 거치지 않습니다.
- **PPO Detection Standard**: `title` 인자로 삽입한 특수 문자 및 스크립트 마커가 DOM에 도달하여 HTML 구조로서 실행되는 시점에 검출됩니다.

---

### 8. site012-bug08 (SEC-118)
- **Vulnerability Type**: Reflected XSS
- **Target Endpoint**: `GET /api/reports`
- **Parameter**: `filter`
- **Occurrence Condition**: 점주 비즈니스 분석 페이지에서 대시보드 리포트 필터 조건을 지정하고 조회 결과를 받을 때 필터 명세 부분에서 발생합니다.
- **Root Cause**: `GET /api/reports?filter=...` API가 `req.query.filter` 값을 이스케이프 처리 없이 결과 명세 필드에 echo하여 내려보냅니다.
- **PPO Detection Standard**: 쿼리 인자로 삽입한 특수 문자 마커가 HTML 노드로 브라우저 화면에 활성화되는 경우로 규정합니다.

---

### 9. site012-bug09 (SEC-119)
- **Vulnerability Type**: Reflected XSS
- **Target Endpoint**: `POST /api/menu/csv/preview`
- **Parameter**: `filename`
- **Occurrence Condition**: 점주가 메뉴판 CSV 데이터를 일괄 업로드하고 완료 미리보기 카드에 업로드된 파일명을 노출할 때 발생합니다.
- **Root Cause**: 백엔드 업로드 미리보기 핸들러가 `filename` 파라미터의 변환 없이 그대로 반환합니다.
- **PPO Detection Standard**: 파일 이름 파라미터 `filename`에 주입한 마커 코드가 실행 가능한 DOM에 삽입되어 동작함을 탐지합니다.

---

### 10. site012-bug10 (SEC-120)
- **Vulnerability Type**: Reflected XSS
- **Target Endpoint**: `GET /api/tools/query`
- **Parameter**: `q`
- **Occurrence Condition**: 관리자용 기술적 API Query 테스트 콘솔에 쿼리를 입력하고 실행 결과를 확인할 때 발생합니다.
- **Root Cause**: 백엔드가 `q` 파라미터 데이터를 여과 없이 echo하여 전송하며 프론트엔드가 이를 이스케이프 없이 삽입합니다.
- **PPO Detection Standard**: API 쿼리 문자열에 주입한 마커가 필터링되지 않고 텍스트 노드가 아닌 HTML 노드(executable DOM Sink)로 화면에 활성화되는 경우로 규정합니다.
