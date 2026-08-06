# BoxSpace (site132_공유창고보관함관리_보관함상태계약기간불일치)

공유창고 보관함 계약, 입출고 24h 스마트 센서, 보관 상태 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5232`

---

## 🏗️ 디렉토리 구조

```
site132_공유창고보관함관리_보관함상태계약기간불일치
├─ frontend (React + Vite, Port: 5232)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9631)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9631`
- **Frontend 화면**: `http://localhost:5232`

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

- **스마트 보관함 배치도**: 70개 셀프 공유 보관함(보관함 번호, 규격, 소속 지점, 임대료, 계약기간, 이용 고객) 관제.
- **공유창고 지점 & 계약 대장**: 8개 전국 공유창고 지점 점유율 & 50건의 정기 임대차 계약 대장 관리.
- **고객 대장 & 입출고 로그**: 45명 이용 고객, 80건의 실시간 입출고 로그 & 90건의 감사 이력 관제.
- **보관함 상태**: 사용가능(AVAILABLE), 사용중(IN_USE), 만료임박(EXPIRING_SOON), 점검중(MAINTENANCE), 계약종료(TERMINATED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 계약 기간을 변경(3초 지연 완료) 직후 보관함 상태를 사용중(IN_USE - 0.1초 완료)으로 변경하면, 상태 변경 API는 먼저 완료되나 3초 뒤 완료되는 계약 기간 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 계약 기간 및 구 상태)을 덮어써 저장됩니다. 새로고침 시 보관함의 계약 기간과 상세 패널의 보관함 상태가 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 계약 종료 API(0.5초 완료) 직후 입고 처리 API(4초 지연 완료) 호출 시, 계약 종료는 성공하지만 늦게 완료된 입고 처리 요청이 종료된 계약을 다시 `IN_USE`(사용중) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 보관함 목록을 만료일순 또는 이용료순으로 정렬 후 상세 버튼 클릭 시 `sortedLockers` 배열 대신 원본 `lockers[]` 배열의 같은 인덱스 보관함이 선택됩니다.

4. **통계 집계 불일치**
   - 입출고 로그 삭제(`DELETE /api/in-out-logs/:id`) 시 입출고 로그 목록에서 소거되나 `boxStats`(지점별 점유율, 월별 계약 수 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 지점 필터를 `강남역점`(3초 지연) → `홍대입구점`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 강남역점 결과가 최신 홍대입구점 보관함 목록을 덮어써 보관함 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 직원 A(김창고)에서 직원 B(이보관)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 만료예정 수(`cachedExpiringCount`) 및 최근 보관함 알림(`cachedRecentLocker`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 계약 강제종료 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `LOCKER CONTRACT TERMINATED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 고객 정보 수정(고객 성명, 연락처, 보관품 메모) 동시 수정 시 백엔드는 고객 성명과 보관품 메모만 저장하고 연락처는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `사용중 변경 + 즉시 기간 변경 (Error 1)` 클릭 ➔ 0.1초 후 사용중 상태 변경 완료 ➔ 3초 후 계약 기간 변경 완료 ➔ 새로고침 시 보관함 상태가 롤백됨 확인.
2. **Error 2**: `⚡ 계약 종료 후 물품 입고 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 계약 종료(TERMINATED) ➔ 4초 후 입고 처리가 IN_USE로 복원됨 확인.
3. **Error 3**: 좌측 `계약 만료일 임박순` 정렬 선택 ➔ 최상단 보관함 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 보관함 데이터 표시됨 확인.
4. **Error 4**: 입출고 이력 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 입출고 로그 목록에서 소거 ➔ 지점별 점유율 수치 변경되지 않음 확인.
5. **Error 5**: 지점 필터를 `강남역점` → 즉시 `홍대입구점`으로 변경 ➔ 3초 후 강남 결과가 홍대 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김창고(A)` → `이보관(B)`으로 전환 ➔ 목록은 갱신되나 상단 만료예정 수치는 A 캐시(12건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 보관함 계약 강제종료 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 LOCKER CONTRACT TERMINATED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 고객 정보 수정 > 이름, 연락처, 보관품 메모 수정 후 `고객 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 연락처만 이전 값 유지됨 확인.
