# AutoCheck (site056) 의도적 오류 목록 (BUGS.md)

이 문서는 AutoCheck 중고차 점검·예약 플랫폼에 구현된 정확히 5개의 의도적 오류(SEC) 목록을 정의합니다.

---

### site056-SEC-456

- **bugId**: `site056-SEC-456`
- **type**: `API Response Handling`
- **Korean type**: `204 No Content 응답 JSON 파싱 오류`
- **endpoint**: `/api/bookings/:id`
- **method**: `DELETE`
- **condition**: 사용자가 내 예약 페이지에서 예정된 점검 예약을 취소할 때 발생
- **files**: `src/api/client.js`, `server.js`
- **location**: `src/api/client.js:23`
- **selector**: `button:has-text("예약 취소 확정")`
- **symptom**: 서버에서는 예약 취소가 204 No Content로 정상 처리되지만, 클라이언트에서 응답 본문이 없는 응답을 JSON으로 파싱하려다 `SyntaxError: Unexpected end of JSON input` 예외가 발생함
- **status**: `Open`
- **example**: `DELETE /api/bookings/bk-1001` 호출 시 서버는 HTTP 204를 반환하고, 클라이언트 `request()` 함수는 무조건 `response.json()`을 호출하여 에러 발생
- **cause**: 프론트엔드 API 클라이언트가 HTTP 204 응답의 empty body 여부를 확인하지 않고 무조건 `response.json()`을 실행함
- **PPO expected behavior**: 내 예약 → 예정 예약 선택 → 예약 취소 클릭 → 취소 확정 후 콘솔 또는 화면에 JSON 파싱 실패 에러 메시지가 관찰됨

---

### site056-SEC-457

- **bugId**: `site056-SEC-457`
- **type**: `Async Request`
- **Korean type**: `최신 요청이 이전 AbortController에 의해 취소되는 오류`
- **endpoint**: `/api/vehicles?search=`
- **method**: `GET`
- **condition**: 차량 찾기 페이지에서 검색창에 빠른 연속 타이핑(예: '현' -> '현대' -> '현대 그랜저')을 수행할 때 발생
- **files**: `src/pages/Vehicles.jsx`
- **location**: `src/pages/Vehicles.jsx:49`
- **selector**: `input[placeholder*="통합 검색"]`
- **symptom**: 사용자가 빠르게 여러 글자를 입력하면 최신 검색 요청의 AbortController가 이전 요청 정리 로직에 의해 조기 abort되어 `AbortError`가 발생하고 최신 검색 결과가 갱신되지 않음
- **status**: `Open`
- **example**: '현대' 입력 중 '대'를 입력할 때 새로 할당된 `controllerRef.current`에 대해 `.abort()`가 호출되어 최신 '현대' 요청이 취소됨
- **cause**: 새 `AbortController`를 생성한 후 ref에 먼저 할당하고 이전 controller를 abort하려다 방금 생성된 최신 controller를 abort함
- **PPO expected behavior**: 차량 찾기 → 검색창에 빠른 입력 → 검색 요청이 취소되거나 '검색 요청이 중단되었습니다' 메시지 또는 최신 결과 누락이 화면에 관찰됨

---

### site058-SEC-458 (site056-SEC-458)

- **bugId**: `site056-SEC-458`
- **type**: `File Upload`
- **Korean type**: `파일 확장자와 MIME Type 검증 불일치`
- **endpoint**: `/api/reports/:reportId/documents`
- **method**: `POST`
- **condition**: 점검 리포트 페이지에서 서류/사진 첨부 시 파일명 확장자와 실제 MIME Type이 다른 파일을 업로드할 때 발생
- **files**: `server.js`
- **location**: `server.js:460`
- **selector**: `.dropzone-area, input[type="file"]`
- **symptom**: 파일의 실제 MIME Type이 `application/pdf`임에도 파일명이 `test.jpg`이면 업로드가 승인되거나, 반대로 유효한 이미지임에도 확장자가 다르면 거부됨
- **status**: `Open`
- **example**: `filename: "inspection_photo.jpg"`, `mimeType: "application/pdf"` 요청 시 백엔드가 확장자만 확인하여 정상 등록 처리
- **cause**: 서버의 파일 업로드 유효성 검사 로직이 확장자 정규식 검사만 수행하고 페이로드의 `mimeType`을 대조 검증하지 않음
- **PPO expected behavior**: 점검 리포트 → 관련 서류 추가 → 파일 업로드 요청 시 확장자만으로 통과되거나 거부되는 비정상 검증 상태 관찰 가능

---

### site056-SEC-459

- **bugId**: `site056-SEC-459`
- **type**: `API Contract`
- **Korean type**: `API 오류 상태코드를 200으로 반환하는 오류`
- **endpoint**: `/api/bookings`
- **method**: `POST`
- **condition**: 특정 충돌 시간대(예: 강남센터 10:00 슬롯 등 마감된 시간대)로 예약을 생성할 때 발생
- **files**: `server.js`, `src/pages/Booking.jsx`
- **location**: `server.js:408`
- **selector**: `button:has-text("예약 확정하기")`
- **symptom**: 예약 충돌/실패 상황임에도 서버가 HTTP 200 OK와 함께 `{ success: false, message: "..." }`를 반환하여 프론트엔드가 예약 성공으로 오판하고 완료 화면으로 넘어가지만 실제 데이터베이스에는 예약이 생성되지 않음
- **status**: `Open`
- **example**: 강남센터 10:00 예약 신청 시 HTTP 200 수신 → 화면에는 '점검 예약이 완료되었습니다' 표시 → '내 예약' 페이지로 이동하면 실제 예약이 존재하지 않음
- **cause**: REST API 표준 에러 상태코드(400/409)를 사용하지 않고 HTTP 200 응답 본문에 실패 상태를 반환하여 클라이언트-서버 간 계약 불일치 발생
- **PPO expected behavior**: 점검 예약 진행 → 충돌 슬롯 예약 시도 → 예약 완료 화면 표시 확인 → 내 예약 이동 시 해당 예약이 생성되지 않은 괴리 현상 관찰

---

### site056-SEC-460

- **bugId**: `site056-SEC-460`
- **type**: `Text Search`
- **Korean type**: `Unicode 정규화 차이로 인한 정확 검색 실패`
- **endpoint**: `/api/vehicles?model=`
- **method**: `GET`
- **condition**: 모델명 필터에 Unicode NFD(자모 분리형)로 저장된 차량 모델('제네시스 G80' 또는 '그랜저 GN7')을 브라우저(NFC)로 입력하여 검색할 때 발생
- **files**: `server.js`
- **location**: `server.js:338`
- **selector**: `input[placeholder*="모델명 필터"]`
- **symptom**: 사용자 눈에는 동일한 한글 모델명('제네시스 G80')으로 보이지만, 내부 Unicode 표현 방식(NFC vs NFD)의 차이로 인해 정확 일치 검색에서 해당 차량이 누락됨
- **status**: `Open`
- **example**: `model=제네시스 G80` 검색 시 NFD로 저장된 `vh-04` 차량이 정규화 없이 비교되어 검색 결과 0건으로 반환
- **cause**: 서버의 문자열 검색 로직에서 Unicode 정규화(`normalize("NFC")`)를 수행하지 않아 분해된 유니코드와 결합된 유니코드가 불일치함
- **PPO expected behavior**: 차량 찾기 → 모델명 필터에 '제네시스 G80' 또는 '그랜저 GN7' 입력 후 필터 적용 → 존재하는 매물임에도 검색 결과 0건 반환 관찰
