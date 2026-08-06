# FreshMark (site143_마트신선식품폐기할인관리_폐기상태할인율불일치)

대형마트 신선식품 유통기한 관제, 타임세일 할인, 폐기 손실 관리 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5243`

---

## 🏗️ 디렉토리 구조

```
site143_마트신선식품폐기할인관리_폐기상태할인율불일치
├─ frontend (React + Vite, Port: 5243)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9642)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9642`
- **Frontend 화면**: `http://localhost:5243`

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

- **신선식품 재고 대장**: 70개 신선식품(상품 코드, 상품명, 카테고리, 매장, 보관온도, 할인율, 현재판매가, 유통기한) 관제.
- **지점 매장 & 할인 이력**: 10개 매장 지점 & 60건의 타임세일 할인 적용 로그 관리.
- **손실 폐기 & 감사 로그**: 60건의 유통기한 마감 미판매 폐기 로그 & 90건의 마트 신선식품 통합 감사 이력 관제.
- **진열/폐기 진행 상태**: 정상판매(NORMAL), 할인판매(DISCOUNTED), 폐기예정(DISPOSAL_PENDING), 폐기완료(DISPOSED), 판매완료(SOLD_OUT), 폐기취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 폐기 상태를 폐기예정(DISPOSAL_PENDING - 3초 지연 완료)으로 변경 직후 할인율을 수정(0.1초 완료)하면, 할인율 수정 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 할인율)을 덮어써 저장됩니다. 새로고침 시 폐기 상태와 상세 패널의 할인율이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 폐기 취소 API(0.5초 완료) 직후 판매 완료 API(4초 지연 완료) 호출 시, 폐기 취소는 성공하지만 늦게 완료된 판매 완료 요청이 취소된 상품을 다시 `SOLD_OUT`(판매완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 상품 목록을 유통기한 마감 임박 순 또는 할인율 높은 순으로 정렬 후 상세 버튼 클릭 시 `sortedProducts` 배열 대신 원본 `products[]` 배열의 같은 인덱스 상품이 선택됩니다.

4. **통계 집계 불일치**
   - 폐기 로그 삭제(`DELETE /api/disposal-logs/:id`) 시 폐기 로그 목록에서 소거되나 `freshStats`(매장별 폐기율, 카테고리별 손실금액, 일별 할인 판매 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 매장 필터를 `강남본점`(3초 지연) → `서초점`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 강남본점 결과가 최신 서초점 상품 목록을 덮어써 상품 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 직원 A(김신선)에서 직원 B(이할인)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 폐기예정 수(`cachedDisposalPendingCount`) 및 최근 상품 알림(`cachedRecentProduct`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 폐기 확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `DISPOSAL CONFIRMED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 상품 정보 수정(상품명, 보관온도, 유통기한) 동시 수정 시 백엔드는 상품명과 유통기한만 저장하고 보관온도는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `폐기예정 변경 + 즉시 할인율 수정 (Error 1)` 클릭 ➔ 0.1초 후 할인율 수정 완료 ➔ 3초 후 폐기예정 변경 완료 ➔ 새로고침 시 할인율이 롤백됨 확인.
2. **Error 2**: `⚡ 폐기 취소 후 판매 완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 폐기 취소(CANCELLED) ➔ 4초 후 판매 완료가 SOLD_OUT으로 복원됨 확인.
3. **Error 3**: 좌측 `유통기한 마감 임박 순` 정렬 선택 ➔ 최상단 상품 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 상품 데이터 표시됨 확인.
4. **Error 4**: 손실 폐기 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 폐기 로그 목록에서 소거 ➔ 매장별 폐기율 수치 변경되지 않음 확인.
5. **Error 5**: 매장 필터를 `강남본점` → 즉시 `서초점`으로 변경 ➔ 3초 후 강남본점 결과가 서초점 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김신선(A)` → `이할인(B)`으로 전환 ➔ 목록은 갱신되나 상단 폐기예정 수치는 A 캐시(18건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 신선식품 최종 폐기 확정 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 DISPOSAL CONFIRMED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 상품 정보 수정 > 상품명, 보관온도, 유통기한 수정 후 `상품 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 보관온도만 이전 값 유지됨 확인.
