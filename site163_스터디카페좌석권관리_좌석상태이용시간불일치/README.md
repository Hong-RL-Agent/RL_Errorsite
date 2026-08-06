# StudySeat (site163_스터디카페좌석권관리_좌석상태이용시간불일치)

스터디카페 좌석권, 이용시간 연장, 좌석 배치 통합 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5263`

---

## 🏗️ 디렉토리 구조

```
site163_스터디카페좌석권관리_좌석상태이용시간불일치
├─ frontend (React + Vite, Port: 5263)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9662)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9662`
- **Frontend 화면**: `http://localhost:5263`

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

- **스터디카페 좌석 대장**: 100개 좌석(좌석 번호, 지점명, 현재 이용 회원명, 남은 이용시간, 입실/퇴실 예정 시각) 관제.
- **지점 & 회원 이용권**: 10개 지점 & 70명 등록 회원 및 70개 이용권 발급 내역 관리.
- **입퇴실 로그 & 감사 이력**: 100건의 키오스크 입퇴실 & 태그 실시간 로그 & 90건의 스터디카페 관제 통합 감사 이력 관제.
- **좌석 이용 상태**: 빈좌석(AVAILABLE), 입실완료/사용중(IN_USE), 외출중(AWAY), 퇴실완료(CHECKED_OUT), 이용권취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 좌석 상태를 사용중(IN_USE - 3초 지연 완료)으로 변경 직후 이용시간을 연장(0.1초 완료)하면, 시간 연장 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 이용시간)을 덮어써 저장됩니다. 새로고침 시 좌석 상태와 상세 패널의 이용시간이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 좌석권 취소 API(0.5초 완료) 직후 입실 처리 API(4초 지연 완료) 호출 시, 이용권 취소는 성공하지만 늦게 완료된 입실 처리 요청이 취소된 이용권을 다시 `IN_USE`(사용중) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 회원 목록을 남은 이용시간 많은 순 또는 좌석 번호순으로 정렬 후 상세 버튼 클릭 시 `sortedSeats` 배열 대신 원본 `seats[]` 배열의 같은 인덱스 회원이 선택됩니다.

4. **통계 집계 불일치**
   - 입퇴실 로그 삭제(`DELETE /api/entry-logs/:id`) 시 입퇴실 로그 목록에서 소거되나 `studyStats`(지점별 이용률, 좌석별 회전율, 회원별 누적 이용시간 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 지점 필터를 `강남역 본점 프리미엄관`(3초 지연) → `신촌 연세로 24h 스터디존`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 강남본점 결과가 최신 신촌점 목록을 덮어써 좌석 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 매니저 A(김좌석)에서 매니저 B(이입실)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 시간초과 수(`cachedOvertimeCount`) 및 최근 회원 알림(`cachedRecentMember`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 강제퇴실 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `STUDY SEAT FORCE CHECKOUT COMPLETED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 회원 정보 수정(회원명, 이용권종류, 연락처) 동시 수정 시 백엔드는 회원명과 이용권종류만 저장하고 연락처는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `사용중 변경 + 즉시 이용시간 연장 (Error 1)` 클릭 ➔ 0.1초 후 이용시간 연장 완료 ➔ 3초 후 사용중 변경 완료 ➔ 새로고침 시 이용시간이 롤백됨 확인.
2. **Error 2**: `⚡ 이용권 취소 후 입실 처리 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 이용권 취소(CANCELLED) ➔ 4초 후 입실 처리가 IN_USE로 복원됨 확인.
3. **Error 3**: 좌측 `남은 이용시간 많은 순` 정렬 선택 ➔ 최상단 좌석 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 회원 데이터 표시됨 확인.
4. **Error 4**: 입퇴실 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 입퇴실 로그 목록에서 소거 ➔ 지점별 이용률 수치 변경되지 않음 확인.
5. **Error 5**: 지점 필터를 `강남역 본점 프리미엄관` → 즉시 `신촌 연세로 24h 스터디존`으로 변경 ➔ 3초 후 강남본점 결과가 신촌점 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김좌석(A)` → `이입실(B)`으로 전환 ➔ 목록은 갱신되나 상단 시간초과 수치는 A 캐시(8건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 강제퇴실 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 STUDY SEAT FORCE CHECKOUT COMPLETED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 회원 정보 수정 > 회원명, 이용권종류, 연락처 수정 후 `회원 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 연락처만 이전 값 유지됨 확인.
