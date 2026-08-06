# MarineRent (site159_해양레저장비대여관리_대여상태반납정보불일치)

해양 레저 장비 대여, 안전 교육, 반납 점검 통합 관리 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5259`

---

## 🏗️ 디렉토리 구조

```
site159_해양레저장비대여관리_대여상태반납정보불일치
├─ frontend (React + Vite, Port: 5259)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9658)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9658`
- **Frontend 화면**: `http://localhost:5259`

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

- **해양 레저 장비 대여 대장**: 55건의 대여 예약(대여 코드, 마리나 지점, 장비명, 고객명, 계류장 보관위치, 대여 시작시간, 반납 예정시간, 대여료) 관제.
- **마리나 장비 & 고객**: 60개 해양 레저 장비 (제트스키, SUP 패들보드, 수중스쿠터 등) & 50명 이용 고객 및 60건 사전 안전교육 명단 관리.
- **반납 점검 로그 & 감사 이력**: 70건의 반납 외관 및 작동 상태 실시간 검수 로그 & 90건의 마리나 관제 통합 감사 이력 관제.
- **대여 진행 상태**: 예약완료(RESERVED), 대여중(IN_USE), 반납검수(INSPECTING), 반납완료(COMPLETED), 대여취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 대여 상태를 대여중(IN_USE - 3초 지연 완료)으로 변경 직후 반납 예정 시간을 변경(0.1초 완료)하면, 시간 변경 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 반납 예정 시간)을 덮어써 저장됩니다. 새로고침 시 대여 상태와 상세 패널의 반납 예정 시간이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 대여 취소 API(0.5초 완료) 직후 반납 완료 API(4초 지연 완료) 호출 시, 대여 취소는 성공하지만 늦게 완료된 반납 완료 요청이 취소된 대여를 다시 `COMPLETED`(반납완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 장비 대여 목록을 반납 예정시간 빠른 순 또는 대여료 높은 순으로 정렬 후 대여/상세 버튼 클릭 시 `sortedRentals` 배열 대신 원본 `rentals[]` 배열의 같은 인덱스 대여건이 선택됩니다.

4. **통계 집계 불일치**
   - 반납 점검 로그 삭제(`DELETE /api/return-logs/:id`) 시 반납 점검 로그 목록에서 소거되나 `marineStats`(장비별 손상률, 지점별 이용률, 고객별 대여 횟수 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 지점 필터를 `부산 해운대 마리나 센터`(3초 지연) → `제주 서귀포 마리나 센터`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 부산 해운대 결과가 최신 제주 서귀포 목록을 덮어써 장비 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 지점장 A(김해양)에서 지점장 B(이서핑)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 반납지연 수(`cachedDelayedReturnCount`) 및 최근 대여 알림(`cachedRecentRental`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 손상 확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `MARINE EQUIPMENT DAMAGE CONFIRMED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 장비 정보 수정(장비명, 안전등급, 보관위치) 동시 수정 시 백엔드는 장비명과 안전등급만 저장하고 보관위치는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `대여중 변경 + 즉시 반납 예정 시간 수정 (Error 1)` 클릭 ➔ 0.1초 후 반납 예정 시간 수정 완료 ➔ 3초 후 대여중 변경 완료 ➔ 새로고침 시 반납 예정 시간이 롤백됨 확인.
2. **Error 2**: `⚡ 대여 취소 후 반납 완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 대여 취소(CANCELLED) ➔ 4초 후 반납 완료가 COMPLETED로 복원됨 확인.
3. **Error 3**: 좌측 `반납 예정시간 빠른 순` 정렬 선택 ➔ 최상단 대여건 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 대여건 데이터 표시됨 확인.
4. **Error 4**: 반납 점검 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 반납 점검 로그 목록에서 소거 ➔ 장비별 손상률 수치 변경되지 않음 확인.
5. **Error 5**: 지점 필터를 `부산 해운대 마리나 센터` → 즉시 `제주 서귀포 마리나 센터`로 변경 ➔ 3초 후 부산 해운대 결과가 제주 서귀포 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김해양(A)` → `이서핑(B)`으로 전환 ➔ 목록은 갱신되나 상단 반납지연 수치는 A 캐시(6건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 손상 확정 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 MARINE EQUIPMENT DAMAGE CONFIRMED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 장비 정보 수정 > 장비명, 안전등급, 보관위치 수정 후 `장비 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 보관위치만 이전 값 유지됨 확인.
