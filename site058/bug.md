# FreshLaundry (site058) 의도적 오류 상세 보고서 (bug.md)

이 문서는 `site058` (FreshLaundry 세탁 수거·배송 플랫폼)에 구현된 5개의 Intentional Error (SEC-466 ~ SEC-470)에 대한 상세 명세와 재현 절차를 기술합니다.

---

## 1. site058-SEC-466: Content-Type boundary가 없는 multipart 요청 처리 오류

1. **Bug ID**: `site058-SEC-466`
2. **오류 유형**: `HTTP Request` (`multipart-boundary-mismatch`)
3. **발생 조건**: 주문 상세 화면에서 세탁 전 사진을 등록하기 위해 이미지 파일을 선택하고 업로드를 실행할 때
4. **정상 동작**: 브라우저가 `FormData` 객체를 전송할 때 `multipart/form-data; boundary=----...` 형태로 boundary 문자열을 자동으로 헤더에 포함하여 서버가 각 파트를 정상적으로 파싱해야 한다.
5. **실제 동작**: 프론트엔드 API 클라이언트(`src/api/client.js`)에서 `headers: { 'Content-Type': 'multipart/form-data' }`를 고정 지정하여 필수 boundary 파라미터가 누락되고, 서버는 이를 정상적인 멀티파트 요청으로 파싱하지 못해 HTTP 400 Bad Request 에러를 반환한다.
6. **재현 절차**:
   - 상단 네비게이션에서 [주문 내역] 클릭
   - 임의 주문(예: `FL-20260930-101`) 클릭하여 주문 상세 페이지로 진입
   - 하단 '세탁물 사진 및 특이사항 등록'의 [세탁 전 사진 추가하기] 클릭 후 이미지 파일 선택
   - 화면에 빨간색 에러 알림("잘못된 멀티파트 요청입니다 (boundary 누락)") 노출 확인
7. **관련 API**: `POST /api/orders/:orderId/items/photo`
8. **관련 파일**: `src/api/client.js`, `src/pages/OrderDetail.jsx`, `server.js`
9. **오류 원인**: `FormData` 전송 시 브라우저 자동 헤더 설정을 덮어쓰고 boundary 없는 수동 Content-Type 지정
10. **PPO가 관찰할 수 있는 현상**: 파일 선택 후 업로드가 실패하고 400 Bad Request 에러 메시지가 화면에 출력됨
11. **기대되는 탐색 trajectory**:
    ```text
    주문 내역 → 주문 상세 → 세탁물 사진 등록 → 파일 선택 → 400 Bad Request 업로드 에러 관찰
    ```

---

## 2. site058-SEC-467: Promise.all() 중 하나의 실패가 전체 주문 정보 렌더링을 차단하는 오류

1. **Bug ID**: `site058-SEC-467`
2. **오류 유형**: `Async Composition` (`promise-all-failure-propagation`)
3. **발생 조건**: 주문 내역에서 `FL-20260924-412` (`ord-1004`) 주문의 상세 페이지로 이동할 때
4. **정상 동작**: 배송 정보 조회 API가 일시적으로 실패하더라도, 정상적으로 조회된 핵심 주문 기본 정보와 세탁물 품목 목록은 화면에 렌더링되어야 한다.
5. **실제 동작**: `OrderDetail.jsx`에서 `Promise.all([getOrderById, getOrderItems, getOrderDelivery])` 구조를 사용하여, `ord-1004`의 배송 정보 API가 500 에러를 반환하는 순간 `Promise.all` 전체가 reject되어 정상 로드된 주문 정보와 세탁물 목록까지 모두 차단되고 전체 페이지가 "주문 정보 로딩 실패" 에러 상태로 전환된다.
6. **재현 절차**:
   - 상단 네비게이션에서 [주문 내역] 클릭
   - 4번째 주문인 `FL-20260924-412` (가죽 & 아웃도어 특수세탁) 카드 클릭
   - 주문 상세 화면이 로딩되지 않고 "주문 정보 로딩 실패" 화면이 표시되는 현상 확인
7. **관련 API**: `GET /api/orders/:id`, `GET /api/orders/:id/items`, `GET /api/orders/:id/delivery`
8. **관련 파일**: `src/pages/OrderDetail.jsx`, `server.js`
9. **오류 원인**: 복합 비동기 데이터 조회 시 부분 실패 허용(allSettled 또는 개별 catch) 없이 단일 `Promise.all`로 결합
10. **PPO가 관찰할 수 있는 현상**: 주문 목록에는 분명히 존재하는 주문임에도 상세 화면 진입 시 전체 페이지가 에러 화면으로 차단됨
11. **기대되는 탐색 trajectory**:
    ```text
    주문 내역 → FL-20260924-412 클릭 → 주문 상세 진입 → 전체 렌더링 실패 화면 관찰
    ```

---

## 3. site058-SEC-468: HTTP Range 헤더 처리 오류로 일부 콘텐츠 요청이 전체 콘텐츠로 반환됨

1. **Bug ID**: `site058-SEC-468`
2. **오류 유형**: `HTTP Protocol` (`range-request-handling`)
3. **발생 조건**: 주문 상세 페이지에서 [영수증 / 인수증] 버튼을 눌러 전자 영수증 미리보기 모달을 열 때
4. **정상 동작**: 클라이언트가 문서의 특정 바이트 구간(`Range: bytes=0-99`)을 요청하면 서버는 HTTP `206 Partial Content` 상태코드와 `Content-Range: bytes 0-99/...` 헤더를 포함하여 해당 범위만 응답해야 한다.
5. **실제 동작**: 백엔드 `GET /api/orders/:id/receipt` 핸들러가 클라이언트의 Range 요청 헤더를 무시하고 항상 HTTP `200 OK` 상태코드와 함께 전체 영수증 전문 텍스트를 반환한다.
6. **재현 절차**:
   - 상단 네비게이션에서 [주문 내역] → 임의 주문(예: `FL-20260930-101`) 상세 진입
   - 상단 우측의 [영수증 / 인수증] 버튼 클릭
   - 모달 상단의 Range 요청 버튼 [Range: 0-99 bytes] 클릭
   - 하단 응답 안내에 `응답 상태코드: 200 OK (전체 데이터 수신됨)` 및 전체 본문이 노출되는 프로토콜 불일치 확인
7. **관련 API**: `GET /api/orders/:id/receipt`
8. **관련 파일**: `server.js`, `src/pages/OrderDetail.jsx`
9. **오류 원인**: 서버에서 HTTP Range 헤더 파싱 및 206 Partial Content 반환 규약 미구현
10. **PPO가 관찰할 수 있는 현상**: 부분 바이트 범위 요청임에도 206이 아닌 200 OK와 함께 전체 콘텐츠가 반환되는 네트워크 이상 현상 관찰
11. **기대되는 탐색 trajectory**:
    ```text
    주문 상세 → 영수증 미리보기 열기 → Range 버튼 클릭 → 206이 아닌 200 OK 전체 데이터 반환 확인
    ```

---

## 4. site058-SEC-469: React Portal 외부 클릭 감지 범위 오류

1. **Bug ID**: `site058-SEC-469`
2. **오류 유형**: `DOM Event` (`portal-outside-click-detection`)
3. **발생 조건**: 세탁 신청(`NewOrder.jsx`) 페이지에서 '3. 수거 및 배송 주소'의 [주소 변경] 버튼을 눌러 모달을 연 뒤 주소 목록을 클릭할 때
4. **정상 동작**: 팝업 내부의 주소 항목을 클릭하면 해당 주소가 선택되고 팝업이 닫혀야 한다.
5. **실제 동작**: 모달이 `ReactDOM.createPortal`을 통해 `document.body`에 렌더링되지만, 바깥 클릭 감지 로직이 인라인 `addressContainerRef`에 대해 `!containerRef.current.contains(e.target)`을 검사하여 포털 내부 클릭을 외부 클릭으로 오판하고, 실제 주소 선택 핸들러가 실행되기 전에 모달을 조기 종료시켜 주소 변경이 적용되지 않는다.
6. **재현 절차**:
   - 상단 네비게이션에서 [세탁 신청] 클릭
   - 세탁물 선택 후 스크롤을 내려 '3. 수거 및 배송 주소' 영역의 [주소 변경] 버튼 클릭
   - 팝업으로 나타난 주소 목록 중 '회사 / 사무실' 또는 '부모님 댁' 카드 클릭
   - 주소가 변경되지 않고 모달만 즉시 닫혀 기존 주소가 유지되는 현상 확인
7. **관련 API**: `N/A` (Frontend DOM Event)
8. **관련 파일**: `src/pages/NewOrder.jsx`
9. **오류 원인**: React Portal의 DOM 트리 위치와 React 컴포넌트 Ref 간의 바운더리 불일치
10. **PPO가 관찰할 수 있는 현상**: 팝업 내 주소 카드를 분명히 클릭했음에도 선택이 무시되고 팝업이 닫혀버리는 현상
11. **기대되는 탐색 trajectory**:
    ```text
    세탁 신청 → 주소 변경 클릭 → 팝업 내 주소 카드 클릭 → 주소 미반영 상태로 팝업 닫힘 관찰
    ```

---

## 5. site058-SEC-470: 서버가 ETag를 잘못 재사용하여 변경된 주문 상태에 304 Not Modified를 반환

1. **Bug ID**: `site058-SEC-470`
2. **오류 유형**: `HTTP Caching` (`stale-etag-revalidation`)
3. **발생 조건**: 주문 상세 페이지에서 [상태 새로고침] 버튼을 눌러 조건부 GET 요청(`If-None-Match`)을 보낼 때
4. **정상 동작**: 서버 측에서 주문 상태가 변경(예: '수거 예정' → '세탁 중' 등)되었다면 새로운 ETag와 함께 최신 상태 데이터(HTTP 200)를 반환해야 한다.
5. **실제 동작**: 서버가 ETag를 주문 ID에 고정된 정적 문자열(`"etag-ord-1001"`)로 항상 반환하므로, 클라이언트가 `If-None-Match: "etag-ord-1001"` 헤더를 보내면 서버가 상태 변경 여부를 검사하지 않고 HTTP `304 Not Modified`를 응답하여 클라이언트가 구 상태를 그대로 유지한다.
6. **재현 절차**:
   - 상단 네비게이션에서 [주문 내역] → `FL-20260930-101` 주문 상세 진입 (초기 상태: '수거 예정')
   - 상단 우측의 [상태 새로고침] 버튼 클릭
   - 백엔드 상태 변경과 무관하게 `서버 ETag 검증 완료: 변경 사항 없음 (HTTP 304 Not Modified)` 메시지가 노출되고 구 상태가 유지되는 현상 확인
7. **관련 API**: `GET /api/orders/:id/status`
8. **관련 파일**: `server.js`, `src/pages/OrderDetail.jsx`
9. **오류 원인**: 리소스 상태 변경이 반영되지 않는 정적 ETag 생성 및 무조건적 304 응답
10. **PPO가 관찰할 수 있는 현상**: 새로고침을 실행했으나 304 Not Modified 응답으로 인해 실시간 상태 갱신이 반영되지 않음
11. **기대되는 탐색 trajectory**:
    ```text
    주문 상세 → 상태 새로고침 클릭 → 304 Not Modified 수신 및 이전 상태 유지 관찰
    ```
