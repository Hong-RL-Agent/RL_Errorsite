# FishAuction (site126_수산시장경매출하관리_낙찰상태출하수량불일치)

수산시장 경매, 중도매인 낙찰, 콜드체인 출하 수량 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5226`

---

## 🏗️ 디렉토리 구조

```
site126_수산시장경매출하관리_낙찰상태출하수량불일치
├─ frontend (React + Vite, Port: 5226)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9625)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9625`
- **Frontend 화면**: `http://localhost:5226`

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

- **수산물 경매 대장**: 50건의 경매 물량(산지 어항, 보관 온도, 경매 수량, 시작가, 최고 낙찰가) 관제.
- **수산물 품목 & 중도매인**: 40개 위생 수산물 품목 & 30명 공인 중도매인 한도액 관리.
- **콜드체인 출하 & 감사 이력**: 70건의 차량 출하 실적 로그 & 90건의 수산 유통 감사 로그 관리.
- **경매 상태**: 입찰중(BIDDING), 낙찰대기(WIN_PENDING), 낙찰완료(WON), 출하완료(SHIPPED), 취소됨(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 낙찰 상태를 낙찰완료(WON - 3초 지연 완료)로 변경 직후 출하 수량을 수정(0.1초 완료)하면, 수량 수정 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 수량)을 덮어써 저장됩니다. 새로고침 시 경매 목록의 수량과 상세 패널의 수량이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 낙찰 취소 API(0.5초 완료) 직후 출하 확정 API(4초 지연 완료) 호출 시, 낙찰 취소는 성공하지만 늦게 완료된 출하 확정 요청이 취소된 낙찰을 다시 `SHIPPED`(출하완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 경매 목록을 최고 낙찰가순으로 정렬 후 상세 버튼 클릭 시 `sortedAuctions` 배열 대신 원본 `auctions[]` 배열의 같은 인덱스 경매가 선택됩니다.

4. **통계 집계 불일치**
   - 출하 로그 삭제(`DELETE /api/shipment-logs/:id`) 시 출하 로그 목록에서 소거되나 `auctionStats`(품목별 시세, 중도매인 낙찰량 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 산지 필터를 `제주 서귀포`(3초 지연) → `부산 자갈치`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 제주 서귀포 결과가 최신 부산 자갈치 경매 목록을 덮어써 경매 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 관리자 A(김경매)에서 관리자 B(이정산)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 낙찰 대기 수(`cachedWinPendingCount`) 및 최근 경매 알림(`cachedRecentAuction`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 낙찰 확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `AUCTION WIN CONFIRMED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 품목 정보 수정(품목명, 산지, 보관온도) 동시 수정 시 백엔드는 품목명과 보관온도만 저장하고 산지는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `낙찰완료 변경 + 즉시 수량 수정 (Error 1)` 클릭 ➔ 0.1초 후 수량 수정 완료 ➔ 3초 후 낙찰완료 변경 완료 ➔ 새로고침 시 출하 수량이 롤백됨 확인.
2. **Error 2**: `⚡ 낙찰 취소 후 출하 확정 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 낙찰 취소(CANCELLED) ➔ 4초 후 출하 확정이 SHIPPED로 복원됨 확인.
3. **Error 3**: 좌측 `낙찰가 높은순` 정렬 선택 ➔ 최상단 경매 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 경매 데이터 표시됨 확인.
4. **Error 4**: 출하 이력 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 출하 로그 목록에서 소거 ➔ 품목별 시세 수치 변경되지 않음 확인.
5. **Error 5**: 산지 필터를 `제주 서귀포` → 즉시 `부산 자갈치`로 변경 ➔ 3초 후 제주 결과가 부산 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김경매(A)` → `이정산(B)`으로 전환 ➔ 목록은 갱신되나 상단 낙찰대기 수치는 A 캐시(14건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 낙찰 확정 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 AUCTION WIN CONFIRMED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 품목 정보 수정 > 품목명, 산지, 보관온도 수정 후 `품목 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 산지만 이전 값 유지됨 확인.
