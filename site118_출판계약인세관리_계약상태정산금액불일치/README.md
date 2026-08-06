# PublishLedger (site118_출판계약인세관리_계약상태정산금액불일치)

출판사 도서 계약, 저자 인세 정산, 판매 실적 통합 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5218`

---

## 🏗️ 디렉토리 구조

```
site118_출판계약인세관리_계약상태정산금액불일치
├─ frontend (React + Vite, Port: 5218)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9617)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9617`
- **Frontend 화면**: `http://localhost:5218`

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

- **도서 출판 대장**: 40개 출판 도서(장르, 정가, 인세율, 누적 판매량) 관제.
- **저자 및 계약 타임라인**: 25명 저자 & 35건 출판 저작권 계약 상태 관제.
- **인세 정산 내역**: 40건의 분기별 인세 정산(총 매출, 인세 발생액, 세금 차감 및 실지급액) 관리.
- **판매 및 활동 로그**: 80건의 서점 유통 실시간 판매 로그, 80건의 감사 이력 관리.
- **계약 상태**: 원고검토(REVIEWING), 계약체결(CONTRACTED), 출간확정(PUBLISHED), 정산대기(SETTLING), 정산완료(COMPLETED), 계약해지(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 계약 상태를 출간확정(PUBLISHED - 3초 지연 완료)으로 변경 직후 인세율을 수정(0.1초 완료)하면, 인세율 API는 먼저 완료되나 3초 뒤 완료되는 계약 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 인세율)을 덮어써 저장됩니다. 새로고침 시 도서/계약 목록의 인세율과 상세 패널의 인세율이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 계약 해지 API(0.5초 완료) 직후 판매량 반영 API(4초 지연 완료) 호출 시, 계약 해지는 성공하지만 늦게 완료된 판매량 반영 요청이 해지된 계약을 다시 `SETTLING`(정산대기) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 도서 목록을 누적 판매량순으로 정렬 후 상세 버튼 클릭 시 `sortedBooks` 배열 대신 원본 `books[]` 배열의 같은 인덱스 도서 상세가 열립니다.

4. **통계 집계 불일치**
   - 판매 로그 삭제(`DELETE /api/sales-logs/:id`) 시 로그 목록에서 소거되나 `publishStats`(도서별 판매량, 저자별 인세 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 장르 필터를 `소설`(3초 지연) → `인문/교양`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 소설 결과가 최신 인문/교양 도서 목록을 덮어써 도서 목록과 오른쪽 정산 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 직원 A(김출판)에서 직원 B(이정산)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 정산대기 수(`cachedSettlingCount`) 및 최근 저자 알림(`cachedRecentAuthor`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 정산 확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `SETTLEMENT CONFIRMED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 도서 정보 수정(제목, 출간일, 인세율) 동시 수정 시 백엔드는 제목과 인세율만 저장하고 출간일은 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `출간확정 변경 + 즉시 인세율 수정 (Error 1)` 클릭 ➔ 0.1초 후 인세율 수정 완료 ➔ 3초 후 출간확정 변경 완료 ➔ 새로고침 시 인세율이 롤백됨 확인.
2. **Error 2**: `⚡ 계약 해지 후 판매량 반영 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 계약 해지(CANCELLED) ➔ 4초 후 판매량 반영이 SETTLING으로 복원됨 확인.
3. **Error 3**: 좌측 `누적 판매량순` 정렬 선택 ➔ 최상단 도서 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 도서 데이터 표시됨 확인.
4. **Error 4**: 판매 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 판매 로그 목록에서 소거 ➔ 도서별 판매량 수치 변경되지 않음 확인.
5. **Error 5**: 장르 필터를 `소설` → 즉시 `인문/교양`으로 변경 ➔ 3초 후 소설 결과가 인문/교양 목록을 덮어씀 확인.
6. **Error 6**: 상단 직원을 `김출판(A)` → `이정산(B)`으로 전환 ➔ 목록은 갱신되나 상단 정산대기 수치는 A 캐시(5건) 잔존 확인.
7. **Error 7**: 판매 로그 탭 > `🔒 권한 없는 직원의 인세 정산 강제 확정 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 SETTLEMENT CONFIRMED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 도서 정보 수정 > 제목, 출간일, 인세율 수정 후 `도서 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 출간일만 이전 값 유지됨 확인.
