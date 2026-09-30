# FreshLaundry (site058) 의도적 오류 목록 (BUGS.md)

이 문서는 FreshLaundry 세탁 수거·배송 플랫폼에 구현된 정확히 5개의 의도적 오류(SEC) 목록을 정의합니다.

---

### site058-SEC-466

- **bugId**: `site058-SEC-466`
- **type**: `HTTP Request`
- **Korean type**: `Content-Type boundary가 없는 multipart 요청 처리 오류`
- **endpoint**: `/api/orders/:orderId/items/photo`
- **method**: `POST`
- **condition**: 주문 상세 화면에서 세탁물 사진을 선택하여 업로드할 때 발생
- **files**: `src/api/client.js`, `server.js`
- **location**: `src/api/client.js:89`
- **selector**: `input[type="file"], label:has-text("사진 추가하기")`
- **symptom**: 브라우저가 boundary를 자동 생성하지 못하도록 프론트엔드에서 수동으로 `headers: { 'Content-Type': 'multipart/form-data' }`를 지정하여 boundary 파라미터가 누락되고 서버에서 400 Bad Request 에러가 발생함
- **status**: `Open`
- **example**: `POST /api/orders/ord-1001/items/photo` 요청 시 `Content-Type: multipart/form-data`만 전송되어 `boundary=...`가 없으므로 서버가 파싱 실패 반환
- **cause**: `FormData` 전송 시 브라우저의 기본 헤더 자동 설정을 덮어쓰고 boundary가 없는 고정 Content-Type 헤더를 전송함
- **PPO expected behavior**: 주문 내역 → 주문 상세 → 세탁물 사진 추가 → 사진 업로드 시도 → 400 에러 알림 및 업로드 실패 관찰

---

### site058-SEC-467

- **bugId**: `site058-SEC-467`
- **type**: `Async Composition`
- **Korean type**: `Promise.all() 중 하나의 실패가 전체 주문 정보 렌더링을 차단하는 오류`
- **endpoint**: `/api/orders/:id`, `/api/orders/:id/items`, `/api/orders/:id/delivery`
- **method**: `GET`
- **condition**: 주문 내역에서 특정 주문(`ord-1004`)의 상세 화면으로 진입할 때 발생
- **files**: `src/pages/OrderDetail.jsx`, `server.js`
- **location**: `src/pages/OrderDetail.jsx:35`
- **selector**: `.order-card:has-text("FL-20260924-412")`
- **symptom**: 주문 기본 정보와 품목 데이터가 정상 존재함에도 불구하고 부가 정보인 배송 관제 API(500 에러)의 실패로 인해 `Promise.all()` 전체가 reject되어 페이지 전체가 "주문 정보 로딩 실패" 에러 상태로 렌더링됨
- **status**: `Open`
- **example**: `ord-1004` 주문 상세 조회 시 배송 API 실패 하나로 인해 세탁물 목록, 수거 정보, 결제 금액 등 모든 정상 데이터 렌더링 차단
- **cause**: 독립적인 비동기 요청을 `Promise.allSettled` 또는 개별 fallback 처리하지 않고 엄격한 `Promise.all()`로 결합하여 단일 실패가 전체로 전파됨
- **PPO expected behavior**: 주문 내역 → `FL-20260924-412` 주문 클릭 → 주문 상세 전체가 에러 화면으로 차단되는 현상 관찰

---

### site058-SEC-468

- **bugId**: `site058-SEC-468`
- **type**: `HTTP Protocol`
- **Korean type**: `HTTP Range 헤더 처리 오류로 일부 콘텐츠 요청이 전체 콘텐츠로 반환됨`
- **endpoint**: `/api/orders/:id/receipt`
- **method**: `GET`
- **condition**: 주문 상세 화면에서 영수증/인수증 미리보기를 열고 특정 바이트 구간(Range)을 요청할 때 발생
- **files**: `server.js`
- **location**: `server.js:304`
- **selector**: `button:has-text("영수증 / 인수증")`
- **symptom**: 클라이언트가 `Range: bytes=0-99` 헤더를 보내도 서버가 Range 요청을 무시하고 항상 `200 OK` 상태코드와 함께 전체 영수증 본문을 반환함 (206 Partial Content 미지원)
- **status**: `Open`
- **example**: `Range: bytes=0-99` 요청 시 100바이트 부분 응답(206)이 아닌 전체 텍스트와 200 OK가 응답됨
- **cause**: 서버 라우트 핸들러가 Range 헤더를 파싱하여 부분 슬라이스를 반환하는 표준 HTTP Range 프로토콜 규약을 무시하고 전체 응답을 반환함
- **PPO expected behavior**: 주문 상세 → 영수증 미리보기 → Range 요청 버튼 클릭 → 206 Partial이 아닌 200 OK 전체 데이터 반환 현상 관찰

---

### site058-SEC-469

- **bugId**: `site058-SEC-469`
- **type**: `DOM Event`
- **Korean type**: `React Portal 외부 클릭 감지 범위 오류`
- **endpoint**: `N/A` (Frontend DOM Event)
- **method**: `UI Click`
- **condition**: 세탁 신청(`NewOrder.jsx`) 페이지에서 [주소 변경] 모달을 열고 주소 목록의 항목을 클릭할 때 발생
- **files**: `src/pages/NewOrder.jsx`
- **location**: `src/pages/NewOrder.jsx:54`
- **selector**: `button:has-text("주소 변경")`
- **symptom**: 주소 선택 모달이 `ReactDOM.createPortal`을 통해 `document.body`에 렌더링되지만, 바깥 클릭 감지 로직이 인라인 `addressContainerRef`를 기준으로 검사하여 모달 내부 클릭을 외부 클릭으로 오판하고 주소 선택 이벤트 실행 전에 모달을 닫아버림
- **status**: `Open`
- **example**: 주소 변경 모달에서 다른 주소 카드를 클릭하면 선택이 반영되지 않고 모달이 바로 닫힘
- **cause**: React Portal의 DOM 트리 이탈 구조를 고려하지 않고 `ref.contains(e.target)`으로 외부 클릭을 판별하는 이벤트 버블링/DOM 바운더리 오류
- **PPO expected behavior**: 세탁 신청 → 주소 변경 클릭 → 팝업 내 주소 항목 클릭 → 주소 미선택 상태로 모달 즉시 닫힘 관찰

---

### site058-SEC-470

- **bugId**: `site058-SEC-470`
- **type**: `HTTP Caching`
- **Korean type**: `서버가 ETag를 잘못 재사용하여 변경된 주문 상태에 304 Not Modified를 반환`
- **endpoint**: `/api/orders/:id/status`
- **method**: `GET`
- **condition**: 주문 상세 화면에서 [상태 새로고침] 버튼을 눌러 조건부 GET(If-None-Match) 요청을 보낼 때 발생
- **files**: `server.js`
- **location**: `server.js:231`
- **selector**: `button:has-text("상태 새로고침")`
- **symptom**: 서버 내부에서 주문 상태가 변경되었음에도 ETag가 주문 ID 기반의 정적 문자열(`"etag-ord-1001"`)로 고정되어 있어, 클라이언트의 `If-None-Match` 요청에 대해 서버가 변경 여부를 무시하고 `304 Not Modified`를 반환하여 클라이언트 화면이 구 상태를 유지함
- **status**: `Open`
- **example**: 주문 상태가 '수거 예정'에서 '세탁 중'으로 바뀌었어도 클라이언트가 상태 새로고침 시 304 응답을 받아 화면에 여전히 '수거 예정'으로 남음
- **cause**: 리소스의 내용 변경(상태, 수정일시)을 ETag 해시에 반영하지 않고 불변 정적 ID로 ETag를 생성하여 잘못된 304 재검증 응답을 반환함
- **PPO expected behavior**: 주문 상세 → 상태 새로고침 클릭 → 서버 실제 상태 변경에도 불구하고 304 Not Modified 수신 및 구 상태 유지 관찰
