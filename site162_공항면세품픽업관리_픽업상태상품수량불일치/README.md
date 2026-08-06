# DutyPickup (site162_공항면세품픽업관리_픽업상태상품수량불일치)

공항 면세품 주문, 픽업 카운터 위치, 상품 수량 통합 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5262`

---

## 🏗️ 디렉토리 구조

```
site162_공항면세품픽업관리_픽업상태상품수량불일치
├─ frontend (React + Vite, Port: 5262)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9661)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9661`
- **Frontend 화면**: `http://localhost:5262`

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

- **면세품 주문 대장**: 70개 면세품 주문(주문 코드, 승객명, 여권 영문명, 탑승 항공편, 인도장 카운터, 출국 시각, 상품명, 수량, 결제금액) 관제.
- **픽업 카운터 & 승객**: 15개 공항 인도장 카운터 & 60명 출국 승객 및 80개 면세 상품 명단 관리.
- **픽업 로그 & 감사 이력**: 90건의 현장 바코드 스캔 및 인도 서명 로그 & 90건의 인도장 관제 통합 감사 이력 관제.
- **픽업 진행 상태**: 주문완료(ORDERED), 상품준비중(PREPARING), 준비완료(READY), 픽업완료(COMPLETED), 주문취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 픽업 상태를 준비완료(READY - 3초 지연 완료)로 변경 직후 상품 수량을 수정(0.1초 완료)하면, 수량 수정 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 상품 수량)을 덮어써 저장됩니다. 새로고침 시 픽업 상태와 상세 패널의 상품 수량이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 주문 취소 API(0.5초 완료) 직후 픽업 완료 API(4초 지연 완료) 호출 시, 주문 취소는 성공하지만 늦게 완료된 픽업 완료 요청이 취소된 주문을 다시 `COMPLETED`(픽업완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 주문 목록을 출국 시간 임박 순 또는 면세품 수량 많은 순으로 정렬 후 상세 버튼 클릭 시 `sortedOrders` 배열 대신 원본 `orders[]` 배열의 같은 인덱스 주문이 선택됩니다.

4. **통계 집계 불일치**
   - 픽업 로그 삭제(`DELETE /api/pickup-logs/:id`) 시 픽업 로그 목록에서 소거되나 `dutyStats`(카운터별 처리량, 상품별 준비율, 시간대별 픽업률 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 터미널 필터를 `T1 동편 인도장`(3초 지연) → `T2 중앙 인도장`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 T1 동편 결과가 최신 T2 중앙 목록을 덮어써 주문 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 관제장 A(김픽업)에서 관제장 B(이인도)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 준비지연 수(`cachedDelayedPreparationCount`) 및 최근 주문 알림(`cachedRecentOrder`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 픽업 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `DUTY FREE PICKUP COMPLETED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 승객 정보 수정(승객명, 여권영문명, 항공편) 동시 수정 시 백엔드는 승객명과 여권영문명만 저장하고 항공편은 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `준비완료 변경 + 즉시 면세품 수량 수정 (Error 1)` 클릭 ➔ 0.1초 후 수량 수정 완료 ➔ 3초 후 준비완료 변경 완료 ➔ 새로고침 시 수량이 롤백됨 확인.
2. **Error 2**: `⚡ 주문 취소 후 픽업 완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 주문 취소(CANCELLED) ➔ 4초 후 픽업 완료가 COMPLETED로 복원됨 확인.
3. **Error 3**: 좌측 `출국 시간 임박 순` 정렬 선택 ➔ 최상단 주문 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 주문 데이터 표시됨 확인.
4. **Error 4**: 픽업 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 픽업 로그 목록에서 소거 ➔ 카운터별 처리량 수치 변경되지 않음 확인.
5. **Error 5**: 터미널 필터를 `T1 동편 인도장 (11번 게이트 앞)` → 즉시 `T2 중앙 인도장 (252번 게이트 앞)`으로 변경 ➔ 3초 후 T1 동편 결과가 T2 중앙 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김픽업(A)` → `이인도(B)`으로 전환 ➔ 목록은 갱신되나 상단 준비지연 수치는 A 캐시(5건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 픽업 완료 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 DUTY FREE PICKUP COMPLETED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 승객 정보 수정 > 승객명, 여권영문명, 항공편 수정 후 `승객 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 항공편만 이전 값 유지됨 확인.
