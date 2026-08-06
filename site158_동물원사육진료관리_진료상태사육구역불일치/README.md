# ZooCare (site158_동물원사육진료관리_진료상태사육구역불일치)

동물원 사육 관제, 수의 진료, 사육 구역 이동 통합 관리 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5258`

---

## 🏗️ 디렉토리 구조

```
site158_동물원사육진료관리_진료상태사육구역불일치
├─ frontend (React + Vite, Port: 5258)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9657)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9657`
- **Frontend 화면**: `http://localhost:5258`

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

- **동물원 사육 개체 대장**: 70마리 동물 개체(동물 코드, 종명, 동물 이름, 나이, 사육 구역, 건강 등급, 위험도, 담당 사육사) 관제.
- **사육 구역 & 사육사**: 20개 동물원 사육 구역 & 25명 전담 사육사 및 수의관 명단 관리.
- **급여 로그 & 감사 이력**: 90건의 일일 급여 및 영양 투여 실시간 로그 & 90건의 동물원 관제 통합 감사 이력 관제.
- **진료 진행 상태**: 정상사육(NORMAL), 관찰필요(OBSERVING), 진료예약(SCHEDULED), 치료중(IN_TREATMENT), 치료완료(COMPLETED), 취소/퇴원(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 진료 상태를 치료완료(COMPLETED - 3초 지연 완료)로 변경 직후 사육 구역을 변경(0.1초 완료)하면, 구역 변경 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 사육 구역)을 덮어써 저장됩니다. 새로고침 시 진료 상태와 상세 패널의 사육 구역이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 진료 취소 API(0.5초 완료) 직후 급여 기록 등록 API(4초 지연 완료) 호출 시, 진료 취소는 성공하지만 늦게 완료된 급여 기록 등록 요청이 취소된 진료를 다시 `OBSERVING`(관찰필요) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 동물 목록을 건강 위험도 높은 순 또는 입원일 빠른 순으로 정렬 후 상세 버튼 클릭 시 `sortedAnimals` 배열 대신 원본 `animals[]` 배열의 같은 인덱스 동물이 선택됩니다.

4. **통계 집계 불일치**
   - 급여 로그 삭제(`DELETE /api/feeding-logs/:id`) 시 급여 로그 목록에서 소거되나 `zooStats`(종별 급여량, 구역별 건강위험도, 사육사별 처리량 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 사육 구역 필터를 `아프리카 사바나 야생사육장`(3초 지연) → `열대우림 유인원 특별관`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 사바나 결과가 최신 유인원 특별관 목록을 덮어써 동물 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 사육사 A(김사육)에서 사육사 B(이동물)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 치료대기 수(`cachedInTreatmentCount`) 및 최근 동물 알림(`cachedRecentAnimal`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 치료 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `ZOOCARE ANIMAL TREATMENT COMPLETED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 동물 정보 수정(이름, 건강등급, 나이) 동시 수정 시 백엔드는 이름과 건강등급만 저장하고 나이는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `치료완료 변경 + 즉시 사육 구역 변경 (Error 1)` 클릭 ➔ 0.1초 후 사육 구역 변경 완료 ➔ 3초 후 치료완료 변경 완료 ➔ 새로고침 시 사육 구역이 롤백됨 확인.
2. **Error 2**: `⚡ 진료 취소 후 급여 기록 등록 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 진료 취소(CANCELLED) ➔ 4초 후 급여 기록 등록이 OBSERVING으로 복원됨 확인.
3. **Error 3**: 좌측 `건강 위험도 높은 순` 정렬 선택 ➔ 최상단 동물 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 동물 데이터 표시됨 확인.
4. **Error 4**: 급여 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 급여 로그 목록에서 소거 ➔ 종별 급여량 수치 변경되지 않음 확인.
5. **Error 5**: 사육 구역 필터를 `아프리카 사바나 야생사육장` → 즉시 `열대우림 유인원 특별관`으로 변경 ➔ 3초 후 사바나 사육장 결과가 유인원 특별관 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김사육(A)` → `이동물(B)`으로 전환 ➔ 목록은 갱신되나 상단 치료대기 수치는 A 캐시(8마리) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 치료 완료 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 ZOOCARE ANIMAL TREATMENT COMPLETED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 동물 정보 수정 > 이름, 건강등급, 나이 수정 후 `동물 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 나이만 이전 값 유지됨 확인.
