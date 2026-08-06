# PracticeRoom (site144_공연연습실대관출입관리_대관상태출입기록불일치)

공연 연습실 대관 예약, QR 스마트 도어락 출입 기록, 음향 장비 렌탈 관리 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5244`

---

## 🏗️ 디렉토리 구조

```
site144_공연연습실대관출입관리_대관상태출입기록불일치
├─ frontend (React + Vite, Port: 5244)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9643)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9643`
- **Frontend 화면**: `http://localhost:5244`

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

- **연습실 대관 예약 대장**: 55건의 대관 예약(예약 코드, 연습실 명칭, 이용자/팀명, 대관 일자, 사용 시간, 출입 인정 시각, 결제 금액) 관제.
- **연습실 & 아티스트 이용자**: 25개 연습실 공간 & 45명 아티스트/크루 회원 명단 관리.
- **QR 스마트 출입 & 장비 렌탈**: 90건의 실시간 QR/도어락 출입 인증 로그 & 50건의 음향/조명 렌탈 사용 로그 관제.
- **대관 진행 상태**: 예약확정(RESERVED), 사용중(IN_USE), 사용완료(COMPLETED), 취소됨(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 대관 상태를 사용중(IN_USE - 3초 지연 완료)으로 변경 직후 출입 시간을 수정(0.1초 완료)하면, 시간 수정 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 출입 시간)을 덮어써 저장됩니다. 새로고침 시 대관 상태와 상세 패널의 출입 시간이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 예약 취소 API(0.5초 완료) 직후 출입 확인 API(4초 지연 완료) 호출 시, 예약 취소는 성공하지만 늦게 완료된 출입 확인 요청이 취소된 예약을 다시 `IN_USE`(사용중) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 예약 목록을 대관 금액 높은 순 또는 이용 시작시각 빠른 순으로 정렬 후 상세 버튼 클릭 시 `sortedBookings` 배열 대신 원본 `bookings[]` 배열의 같은 인덱스 예약이 선택됩니다.

4. **통계 집계 불일치**
   - 출입 기록 삭제(`DELETE /api/access-logs/:id`) 시 출입 기록 목록에서 소거되나 `roomStats`(연습실별 이용률, 이용자별 사용시간, 장비 사용 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 연습실 필터를 `메인 댄스홀 A (특대형)`(3초 지연) → `밴드 합주실 B (음향특화)`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 댄스홀 A 결과가 최신 합주실 B 목록을 덮어써 예약 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 직원 A(김대관)에서 직원 B(이출입)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 사용중 수(`cachedInUseCount`) 및 최근 예약 알림(`cachedRecentBooking`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 예약 강제취소 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `BOOKING FORCE CANCELLED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 이용자 정보 수정(이름, 소속팀, 연락처) 동시 수정 시 백엔드는 이름과 소속팀만 저장하고 연락처는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `사용중 변경 + 즉시 출입시각 수정 (Error 1)` 클릭 ➔ 0.1초 후 출입시각 수정 완료 ➔ 3초 후 사용중 변경 완료 ➔ 새로고침 시 출입시각이 롤백됨 확인.
2. **Error 2**: `⚡ 예약 취소 후 출입 확인 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 예약 취소(CANCELLED) ➔ 4초 후 출입 확인이 IN_USE로 복원됨 확인.
3. **Error 3**: 좌측 `대관 금액 높은 순` 정렬 선택 ➔ 최상단 예약 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 예약 데이터 표시됨 확인.
4. **Error 4**: 스마트 출입 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 출입 기록 목록에서 소거 ➔ 연습실별 이용률 수치 변경되지 않음 확인.
5. **Error 5**: 연습실 필터를 `메인 댄스홀 A (특대형)` → 즉시 `밴드 합주실 B (음향특화)`로 변경 ➔ 3초 후 댄스홀 A 결과가 합주실 B 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김대관(A)` → `이출입(B)`으로 전환 ➔ 목록은 갱신되나 상단 사용중 수치는 A 캐시(14개실) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 대관 예약 강제 취소 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 BOOKING FORCE CANCELLED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 이용자 정보 수정 > 이름, 소속팀, 연락처 수정 후 `이용자 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 연락처만 이전 값 유지됨 확인.
