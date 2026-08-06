# WineClass (site148_와인클래스예약관리_예약상태좌석정보불일치)

와인 아카데미 클래스 수강 예약, 좌석 배정, 테이스팅 키트 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5248`

---

## 🏗️ 디렉토리 구조

```
site148_와인클래스예약관리_예약상태좌석정보불일치
├─ frontend (React + Vite, Port: 5248)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9647)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9647`
- **Frontend 화면**: `http://localhost:5248`

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

- **와인 수강 예약 대장**: 55건의 수강 예약(예약 코드, 수강 클래스명, 고객 성명, 배정 좌석, 수강 일자, 시음 키트 상태, 수강 결제금액) 관제.
- **좌석 배치 & 클래스 목록**: 80석 오크관 테이스팅 룸 좌석 & 30개 와인 클래스 & 45명 고객 명단 관리.
- **시음 키트 & 감사로그**: 60건의 소믈리에 시음 키트 및 페어링 로그 & 90건의 와인 아카데미 관제 통합 감사 이력 관제.
- **예약 진행 상태**: 예약대기(PENDING), 예약확정(CONFIRMED), 준비완료(KIT_READY), 참석완료(ATTENDED), 예약취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 예약 상태를 예약확정(CONFIRMED - 3초 지연 완료)으로 변경 직후 좌석을 변경(0.1초 완료)하면, 좌석 변경 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 좌석)을 덮어써 저장됩니다. 새로고침 시 예약 상태와 상세 패널의 좌석이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 예약 취소 API(0.5초 완료) 직후 키트 준비완료 API(4초 지연 완료) 호출 시, 예약 취소는 성공하지만 늦게 완료된 키트 준비완료 요청이 취소된 예약을 다시 `KIT_READY`(준비완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 예약 목록을 수강 수수료 높은 순 또는 클래스 일자 빠른 순으로 정렬 후 상세 버튼 클릭 시 `sortedBookings` 배열 대신 원본 `bookings[]` 배열의 같은 인덱스 예약이 선택됩니다.

4. **통계 집계 불일치**
   - 키트 준비 로그 삭제(`DELETE /api/kit-logs/:id`) 시 키트 준비 로그 목록에서 소거되나 `wineStats`(클래스별 준비율, 고객별 참석률, 월별 예약 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 클래스 필터를 `프랑스 보르도 그랑크뤼 마스터 클래스`(3초 지연) → `이탈리아 토스카나 바롤로 시음반`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 보르도반 결과가 최신 바롤로반 목록을 덮어써 예약 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 직원 A(김소믈리에)에서 직원 B(이시음)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 키트대기 수(`cachedPendingKitCount`) 및 최근 예약 알림(`cachedRecentBooking`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 예약 확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `WINE CLASS BOOKING CONFIRMED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 고객 정보 수정(이름, 선호 와인 스타일, 연락처) 동시 수정 시 백엔드는 이름과 선호 와인 스타일만 저장하고 연락처는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `예약확정 변경 + 즉시 좌석 변경 (Error 1)` 클릭 ➔ 0.1초 후 좌석 변경 완료 ➔ 3초 후 예약확정 변경 완료 ➔ 새로고침 시 좌석이 롤백됨 확인.
2. **Error 2**: `⚡ 예약 취소 후 키트 준비완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 예약 취소(CANCELLED) ➔ 4초 후 키트 준비완료가 KIT_READY로 복원됨 확인.
3. **Error 3**: 좌측 `수강 수수료 높은 순` 정렬 선택 ➔ 최상단 예약 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 예약 데이터 표시됨 확인.
4. **Error 4**: 시음 키트 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 키트 준비 로그 목록에서 소거 ➔ 클래스별 준비율 수치 변경되지 않음 확인.
5. **Error 5**: 클래스 필터를 `프랑스 보르도 마스터반` → 즉시 `이탈리아 토스카나 바롤로반`으로 변경 ➔ 3초 후 보르도반 결과가 바롤로반 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김소믈리에(A)` → `이시음(B)`으로 전환 ➔ 목록은 갱신되나 상단 키트대기 수치는 A 캐시(11건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 와인 클래스 예약 확정 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 WINE CLASS BOOKING CONFIRMED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 고객 정보 수정 > 이름, 선호 와인 스타일, 연락처 수정 후 `고객 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 연락처만 이전 값 유지됨 확인.
