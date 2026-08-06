# CraftOrder (site154_공방주문제작관리_제작상태옵션정보불일치)

수제 공방 주문 제작, 커스텀 각인/옵션, 제작 공정 통합 관리 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5254`

---

## 🏗️ 디렉토리 구조

```
site154_공방주문제작관리_제작상태옵션정보불일치
├─ frontend (React + Vite, Port: 5254)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9653)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9653`
- **Frontend 화면**: `http://localhost:5254`

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

- **공방 주문 제작 대장**: 60건의 수제 공방 주문(주문 코드, 옵션 유형, 주문 상품명, 고객명, 옵션 색상, 담당 아티잔, 제작 마감일, 주문 금액) 관제.
- **커스텀 옵션 & 장인 명단**: 40개 핸드메이드 커스텀 옵션 & 15명 아티잔 장인 및 45명 수제 커스텀 주문 고객 명단 관리.
- **공정 로그 & 감사 이력**: 90건의 제작 공정 실시간 작업 로그 & 90건의 공방 관제 통합 감사 이력 관제.
- **제작 진행 상태**: 주문접수(ORDERED), 제작중(IN_PRODUCTION), 품질검수(INSPECTING), 발송완료(SHIPPED), 주문취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 제작 상태를 제작중(IN_PRODUCTION - 3초 지연 완료)으로 변경 직후 옵션 색상을 수정(0.1초 완료)하면, 옵션 색상 수정 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 옵션 색상)을 덮어써 저장됩니다. 새로고침 시 제작 상태와 상세 패널의 옵션 색상이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 주문 취소 API(0.5초 완료) 직후 발송 완료 API(4초 지연 완료) 호출 시, 주문 취소는 성공하지만 늦게 완료된 발송 완료 요청이 취소된 주문을 다시 `SHIPPED`(발송완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 주문 목록을 금액 높은 순 또는 제작 마감일 빠른 순으로 정렬 후 상세 버튼 클릭 시 `sortedOrders` 배열 대신 원본 `orders[]` 배열의 같은 인덱스 주문이 선택됩니다.

4. **통계 집계 불일치**
   - 제작 로그 삭제(`DELETE /api/craft-logs/:id`) 시 제작 로그 목록에서 소거되나 `craftStats`(제작자별 처리량, 옵션별 주문 수, 월별 발송 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 옵션 유형 필터를 `천연 가죽 각인 지갑`(3초 지연) → `원목 커스텀 테이블`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 가죽 지갑 결과가 최신 원목 테이블 목록을 덮어써 주문 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 직원 A(김공방)에서 직원 B(이목수)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 제작지연 수(`cachedDelayedCount`) 및 최근 주문 알림(`cachedRecentOrder`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 발송 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `CRAFT ORDER SHIPPED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 주문 정보 수정(고객명, 배송메모, 옵션색상) 동시 수정 시 백엔드는 고객명과 배송메모만 저장하고 옵션색상은 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `제작중 변경 + 즉시 옵션 색상 수정 (Error 1)` 클릭 ➔ 0.1초 후 옵션 색상 수정 완료 ➔ 3초 후 제작중 변경 완료 ➔ 새로고침 시 옵션 색상이 롤백됨 확인.
2. **Error 2**: `⚡ 주문 취소 후 발송 완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 주문 취소(CANCELLED) ➔ 4초 후 발송 완료가 SHIPPED로 복원됨 확인.
3. **Error 3**: 좌측 `주문 금액 높은 순` 정렬 선택 ➔ 최상단 주문 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 주문 데이터 표시됨 확인.
4. **Error 4**: 공정 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 제작 로그 목록에서 소거 ➔ 제작자별 처리량 수치 변경되지 않음 확인.
5. **Error 5**: 옵션 유형 필터를 `천연 가극 각인 커스텀 지갑` → 즉시 `원목 커스텀 테이블 세트`로 변경 ➔ 3초 후 가죽 지갑 결과가 원목 테이블 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김공방(A)` → `이목수(B)`으로 전환 ➔ 목록은 갱신되나 상단 제작지연 수치는 A 캐시(9건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 주문 발송 완료 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 CRAFT ORDER SHIPPED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 주문 정보 수정 > 고객명, 배송메모, 옵션색상 수정 후 `주문 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 옵션색상만 이전 값 유지됨 확인.
