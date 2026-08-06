# RoyaltyTune (site123_음악저작권정산관리_사용내역정산상태불일치)

음악 저작권 인세, 음원 사용 내역, 창작자 수익 정산 통합 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5223`

---

## 🏗️ 디렉토리 구조

```
site123_음악저작권정산관리_사용내역정산상태불일치
├─ frontend (React + Vite, Port: 5223)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9622)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9622`
- **Frontend 화면**: `http://localhost:5223`

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

- **저작권 음원 대장**: 50개 등록 음원(장르, 대표 권리자, 인세 배분율, 총 매출) 관제.
- **창작자 & 정산 내역**: 35명 음악 창작자 명단 & 45건의 분기별 인세 정산 내역 관리.
- **플랫폼 사용 로그**: 100건의 실시간 음원 스트리밍 사용 로그, 60건의 권리 배분표 & 90건의 감사 이력 관리.
- **정산 상태**: 집계중(CALCULATING), 정산대기(SETTLING), 정산확정(CONFIRMED), 지급완료(PAID), 취소됨(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 정산 상태를 정산확정(CONFIRMED - 3초 지연 완료)으로 변경 직후 권리 배분율을 변경(0.1초 완료)하면, 배분율 변경 API는 먼저 완료되나 3초 뒤 완료되는 정산 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 배분율)을 덮어써 저장됩니다. 새로고침 시 음원 목록의 배분율과 상세 패널의 배분율이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 정산 취소 API(0.5초 완료) 직후 사용 내역 반영 API(4초 지연 완료) 호출 시, 정산 취소는 성공하지만 늦게 완료된 사용 내역 반영 요청이 취소된 정산을 다시 `SETTLING`(정산대기) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 음원 목록을 총 음원 수익순으로 정렬 후 상세 버튼 클릭 시 `sortedTracks` 배열 대신 원본 `tracks[]` 배열의 같은 인덱스 음원이 선택됩니다.

4. **통계 집계 불일치**
   - 사용 내역 삭제(`DELETE /api/usage-logs/:id`) 시 사용 내역 목록에서 소거되나 `royaltyStats`(음원별 수익, 창작자 정산액 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 장르 필터를 `K-POP`(3초 지연) → `발라드`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 K-POP 결과가 최신 발라드 음원 목록을 덮어써 음원 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 관리자 A(김저작)에서 관리자 B(이정산)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 정산 대기 수(`cachedSettlingCount`) 및 최근 상세 알림(`cachedRecentTrack`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 정산 확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `ROYALTY CONFIRMED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 음원 정보 수정(제목, 장르, 대표권리자) 동시 수정 시 백엔드는 제목과 대표권리자만 저장하고 장르는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `정산확정 변경 + 즉시 배분율 변경 (Error 1)` 클릭 ➔ 0.1초 후 배분율 변경 완료 ➔ 3초 후 정산확정 변경 완료 ➔ 새로고침 시 인세 배분율이 롤백됨 확인.
2. **Error 2**: `⚡ 정산 취소 후 사용 내역 반영 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 정산 취소(CANCELLED) ➔ 4초 후 사용 내역 반영이 SETTLING으로 복원됨 확인.
3. **Error 3**: 좌측 `음원 수익 높은순` 정렬 선택 ➔ 최상단 음원 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 음원 데이터 표시됨 확인.
4. **Error 4**: 사용 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 사용 로그 목록에서 소거 ➔ 음원별 수익 수치 변경되지 않음 확인.
5. **Error 5**: 장르 필터를 `K-POP` → 즉시 `발라드`로 변경 ➔ 3초 후 K-POP 결과가 발라드 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김저작(A)` → `이정산(B)`으로 전환 ➔ 목록은 갱신되나 상단 정산대기 수치는 A 캐시(12곡) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 정산 확정 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 ROYALTY CONFIRMED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 음원 정보 수정 > 제목, 장르, 대표권리자 수정 후 `음원 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 장르만 이전 값 유지됨 확인.
