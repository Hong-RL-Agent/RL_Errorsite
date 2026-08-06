# KidsPlay (site150_키즈카페입장놀이시설관리_입장상태이용시간불일치)

프리미엄 키즈카페 입장권, 이용시간 연장, 놀이시설 수용 관리 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5250`

---

## 🏗️ 디렉토리 구조

```
site150_키즈카페입장놀이시설관리_입장상태이용시간불일치
├─ frontend (React + Vite, Port: 5250)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9649)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9649`
- **Frontend 화면**: `http://localhost:5250`

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

- **키즈카페 입장권 대장**: 60건의 키즈카페 입장권(입장 코드, 매장명, 아동 이름, 동반 보호자, 입장 시각, 기본 이용시간, 남은시간, 추가요금) 관제.
- **놀이시설 & 보호자 관리**: 20개 키즈카페 놀이시설 수용 정원 & 50명 동반 보호자 및 70명 수강 아동 명단 관리.
- **이용 로그 & 감사 이력**: 90건의 실시간 시설 놀이 이용 로그 & 90건의 키즈카페 관제 통합 감사 이력 관제.
- **입장 진행 상태**: 입장대기(WAITING), 이용중(IN_USE), 연장중(EXTENDED), 퇴장완료(CHECKED_OUT), 입장취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 입장 상태를 이용중(IN_USE - 3초 지연 완료)으로 변경 직후 이용시간을 연장(0.1초 완료)하면, 이용시간 연장 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 이용시간)을 덮어써 저장됩니다. 새로고침 시 입장 상태와 상세 패널의 이용시간이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 입장 취소 API(0.5초 완료) 직후 놀이시설 이용 등록 API(4초 지연 완료) 호출 시, 입장 취소는 성공하지만 늦게 완료된 놀이시설 이용 등록 요청이 취소된 입장권을 다시 `IN_USE`(이용중) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 입장권 목록을 남은시간순 또는 입장시간순으로 정렬 후 상세 버튼 클릭 시 `sortedTickets` 배열 대신 원본 `tickets[]` 배열의 같은 인덱스 입장권이 선택됩니다.

4. **통계 집계 불일치**
   - 이용 로그 삭제(`DELETE /api/usage-logs/:id`) 시 이용 로그 목록에서 소거되나 `playStats`(시설별 이용률, 시간대별 혼잡도, 매장별 입장 수 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 매장 필터를 `강남 본점 플래그십`(3초 지연) → `잠실 롯데월드몰점`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 강남 본점 결과가 최신 잠실점 목록을 덮어써 입장권 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 직원 A(김키즈)에서 직원 B(이놀이)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 시간초과 수(`cachedOvertimeCount`) 및 최근 상세 알림(`cachedRecentTicket`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 강제퇴장 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `TICKET FORCE CHECKOUT COMPLETED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 보호자 정보 수정(보호자명, 아동관계, 연락처) 동시 수정 시 백엔드는 보호자명과 아동관계만 저장하고 연락처는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `이용중 변경 + 즉시 시간 연장 (Error 1)` 클릭 ➔ 0.1초 후 시간 연장 완료 ➔ 3초 후 이용중 변경 완료 ➔ 새로고침 시 이용시간이 롤백됨 확인.
2. **Error 2**: `⚡ 입장 취소 후 놀이 이용 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 입장 취소(CANCELLED) ➔ 4초 후 놀이 이용 등록이 IN_USE로 복원됨 확인.
3. **Error 3**: 좌측 `남은 이용시간 임박 순` 정렬 선택 ➔ 최상단 입장권 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 입장권 데이터 표시됨 확인.
4. **Error 4**: 이용 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 이용 로그 목록에서 소거 ➔ 시설별 이용률 수치 변경되지 않음 확인.
5. **Error 5**: 매장 필터를 `강남 본점 플래그십` → 즉시 `잠실 롯데월드몰점`으로 변경 ➔ 3초 후 강남 본점 결과가 잠실점 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김키즈(A)` → `이놀이(B)`으로 전환 ➔ 목록은 갱신되나 상단 초과 아동 수치는 A 캐시(8명) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 강제 퇴장 처리 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 TICKET FORCE CHECKOUT COMPLETED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 보호자 정보 수정 > 보호자명, 아동관계, 연락처 수정 후 `보호자 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 연락처만 이전 값 유지됨 확인.
