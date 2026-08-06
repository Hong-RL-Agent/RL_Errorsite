# FlowerBid (site134_화훼경매배송관리_낙찰상태배송수량불일치)

화훼 경매, 생화 낙찰, 출고 수량 & 콜드체인 배송 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5234`

---

## 🏗️ 디렉토리 구조

```
site134_화훼경매배송관리_낙찰상태배송수량불일치
├─ frontend (React + Vite, Port: 5234)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9633)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9633`
- **Frontend 화면**: `http://localhost:5234`

### 실행 방법 (서로 다른 터미널에서 실행)

**백엔드 실행 (터미널 1):**
```bash
cd backend
npm install
npm start
```

**프론트엔드 실행 (터미널 2):**
```bash
cd frontend
npm install
npm run dev
```

---

## 📋 정상 기능 요약

- **화훼 경매 & 낙찰 대장**: 55건의 생화 경매(경매코드, 생화 품목명, 등급, 경매수량, 출고 배송수량, 시작가, 낙찰가, 낙찰 구매자) 관제.
- **화훼 품목 & 구매 도매상**: 45개 생화 품목 재고 현황 & 30명 도매상/플라워 스튜디오 구매자 관리.
- **콜드체인 배송 로그**: 40건의 실시간 냉장 탑차 배송 지시 로그 & 90건의 공판장 감사 이력 관제.
- **낙찰/배송 상태**: 경매중(BIDDING), 낙찰완료(WON), 배송준비(READY_FOR_DELIVERY), 배송중(DELIVERING), 낙찰취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 낙찰 상태를 낙찰완료(WON - 3초 지연 완료)로 변경 직후 배송 수량을 수정(0.1초 완료)하면, 수량 수정 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 배송 수량)을 덮어써 저장됩니다. 새로고침 시 경매 낙찰상태와 상세 패널의 배송 수량이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 낙찰 취소 API(0.5초 완료) 직후 배송 지시 API(4초 지연 완료) 호출 시, 낙찰 취소는 성공하지만 늦게 완료된 배송 지시 요청이 취소된 낙찰을 다시 `READY_FOR_DELIVERY`(배송준비) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 경매 목록을 낙찰가순 또는 등급 신선도순으로 정렬 후 상세 버튼 클릭 시 `sortedAuctions` 배열 대신 원본 `auctions[]` 배열의 같은 인덱스 경매가 선택됩니다.

4. **통계 집계 불일치**
   - 배송 로그 삭제(`DELETE /api/delivery-orders/:id`) 시 배송 로그 목록에서 소거되나 `flowerStats`(품목별 판매량, 구매자별 주문량 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 품목 필터를 `장미`(3초 지연) → `튤립`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 장미 결과가 최신 튤립 경매 목록을 덮어써 경매 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 직원 A(김경매)에서 직원 B(이배송)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 배송대기 수(`cachedPendingDeliveryCount`) 및 최근 경매 알림(`cachedRecentAuction`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 낙찰 확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `WINNING BID CONFIRMED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 품목 정보 수정(꽃이름, 등급, 보관온도) 동시 수정 시 백엔드는 꽃이름과 보관온도만 저장하고 등급은 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `낙찰완료 변경 + 즉시 배송수량 수정 (Error 1)` 클릭 ➔ 0.1초 후 배송수량 수정 완료 ➔ 3초 후 낙찰완료 변경 완료 ➔ 새로고침 시 배송수량이 롤백됨 확인.
2. **Error 2**: `⚡ 낙찰 취소 후 배송 지시 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 낙찰 취소(CANCELLED) ➔ 4초 후 배송 지시가 READY_FOR_DELIVERY로 복원됨 확인.
3. **Error 3**: 좌측 `낙찰가 높은순` 정렬 선택 ➔ 최상단 경매 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 경매 데이터 표시됨 확인.
4. **Error 4**: 배송 이력 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 배송 로그 목록에서 소거 ➔ 품목별 판매량 수치 변경되지 않음 확인.
5. **Error 5**: 품목 필터를 `장미` → 즉시 `튤립`으로 변경 ➔ 3초 후 장미 결과가 튤립 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김경매(A)` → `이배송(B)`으로 전환 ➔ 목록은 갱신되나 상단 배송대기 수치는 A 캐시(14건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 낙찰 최종 확정 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 WINNING BID CONFIRMED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 품목 정보 수정 > 꽃이름, 등급, 보관온도 수정 후 `품목 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 등급만 이전 값 유지됨 확인.
