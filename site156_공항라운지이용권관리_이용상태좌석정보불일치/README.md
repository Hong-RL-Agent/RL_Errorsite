# LoungePass (site156_공항라운지이용권관리_이용상태좌석정보불일치)

공항 프리미엄 라운지 이용권, 체크인, 좌석 배정 통합 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5256`

---

## 🏗️ 디렉토리 구조

```
site156_공항라운지이용권관리_이용상태좌석정보불일치
├─ frontend (React + Vite, Port: 5256)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9655)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9655`
- **Frontend 화면**: `http://localhost:5256`

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

- **공항 라운지 이용권 대장**: 60개 라운지 이용권(이용권 코드, 터미널 위치, 승객 성명, 항공편 번호, 승객 등급, 배정 좌석번호, 만료 예정일시, 이용료) 관제.
- **라운지 & VIP 승객**: 10개 공항 터미널 라운지 & 100개 내부 좌석 배치도 및 50명 VIP 승객 명단 관리.
- **체크인 로그 & 감사 이력**: 90건의 승객 체크인 실시간 입장/퇴장 로그 & 90건의 공항 관제 통합 감사 이력 관제.
- **이용 진행 상태**: 발급완료(ISSUED), 체크인(CHECKED_IN), 이용중(IN_USE), 이용완료(COMPLETED), 이용취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 이용 상태를 이용중(IN_USE - 3초 지연 완료)으로 변경 직후 좌석 번호를 수정(0.1초 완료)하면, 좌석 번호 수정 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 좌석 번호)을 덮어써 저장됩니다. 새로고침 시 이용 상태와 상세 패널의 좌석 번호가 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 체크인 취소 API(0.5초 완료) 직후 이용 완료 API(4초 지연 완료) 호출 시, 체크인 취소는 성공하지만 늦게 완료된 이용 완료 요청이 취소된 체크인을 다시 `COMPLETED`(이용완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 이용권 목록을 만료시간 임박 순 또는 승객 등급 순으로 정렬 후 상세 버튼 클릭 시 `sortedPasses` 배열 대신 원본 `passes[]` 배열의 같은 인덱스 이용권이 선택됩니다.

4. **통계 집계 불일치**
   - 체크인 로그 삭제(`DELETE /api/checkin-logs/:id`) 시 체크인 로그 목록에서 소거되나 `loungeStats`(라운지별 혼잡도, 좌석 이용률, 등급별 이용 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 터미널 필터를 `T1 동편 4층 라운지`(3초 지연) → `T2 퍼스트 라운지`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 T1 동편 결과가 최신 T2 퍼스트 목록을 덮어써 이용권 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 직원 A(김라운지)에서 직원 B(이체크)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 만료임박 수(`cachedExpiringSoonCount`) 및 최근 승객 알림(`cachedRecentPassenger`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 라운지 입장승인 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `LOUNGE PASS ENTRY APPROVED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 승객 정보 수정(이름, 좌석번호, 항공편) 동시 수정 시 백엔드는 이름과 좌석번호만 저장하고 항공편은 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `이용중 변경 + 즉시 좌석 번호 수정 (Error 1)` 클릭 ➔ 0.1초 후 좌석 번호 수정 완료 ➔ 3초 후 이용중 변경 완료 ➔ 새로고침 시 좌석 번호가 롤백됨 확인.
2. **Error 2**: `⚡ 체크인 취소 후 이용 완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 체크인 취소(CANCELLED) ➔ 4초 후 이용 완료가 COMPLETED로 복원됨 확인.
3. **Error 3**: 좌측 `만료시간 임박 순` 정렬 선택 ➔ 최상단 이용권 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 이용권 데이터 표시됨 확인.
4. **Error 4**: 체크인 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 체크인 로그 목록에서 소거 ➔ 라운지별 혼잡도 수치 변경되지 않음 확인.
5. **Error 5**: 터미널 필터를 `제1여객터미널 동편 4층 라운지` → 즉시 `제2여객터미널 250번 게이트 퍼스트`로 변경 ➔ 3초 후 T1 동편 결과가 T2 퍼스트 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김라운지(A)` → `이체크(B)`으로 전환 ➔ 목록은 갱신되나 상단 만료임박 수치는 A 캐시(8건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 라운지 입장승인 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 LOUNGE PASS ENTRY APPROVED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 승객 정보 수정 > 이름, 좌석번호, 항공편 수정 후 `승객 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 항공편만 이전 값 유지됨 확인.
