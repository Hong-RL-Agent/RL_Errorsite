# MealSafe (site129_급식식단알레르기관리_식단예약알레르기정보불일치)

학교 및 기관 급식 식단, 알레르기 안전, 대체식 신청 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5229`

---

## 🏗️ 디렉토리 구조

```
site129_급식식단알레르기관리_식단예약알레르기정보불일치
├─ frontend (React + Vite, Port: 5229)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9628)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9628`
- **Frontend 화면**: `http://localhost:5229`

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

- **알레르기 학생 대장**: 60명의 특이 체질 알레르기 학생(성명, 학년반, 알레르기 항목, 위험 등급, 보호자 연락처) 관제.
- **급식 식단표 & 알레르기 정보**: 35개 주간 급식 식단 & 45개 주요 알레르기 유발 물질 항목 관리.
- **대체식 신청 & 배식 이력**: 40건의 특별 대체식 신청 대장, 70건의 배식 로그 & 90건의 감사 이력 관리.
- **대체식 상태**: 신청대기(PENDING), 승인완료(APPROVED), 배식완료(SERVED), 반려됨(REJECTED), 취소됨(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 대체식 신청 상태를 승인완료(APPROVED - 3초 지연 완료)로 변경 직후 식단을 변경(0.1초 완료)하면, 식단 변경 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 식단)을 덮어써 저장됩니다. 새로고침 시 신청 식단과 상세 패널의 식단이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 대체식 신청 취소 API(0.5초 완료) 직후 배식 완료 API(4초 지연 완료) 호출 시, 신청 취소는 성공하지만 늦게 완료된 배식 완료 요청이 취소된 신청을 다시 `SERVED`(배식완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 학생 목록을 알레르기 위험도순 또는 학년/반순으로 정렬 후 상세 버튼 클릭 시 `sortedStudents` 배열 대신 원본 `students[]` 배열의 같은 인덱스 학생이 선택됩니다.

4. **통계 집계 불일치**
   - 배식 로그 삭제(`DELETE /api/serving-logs/:id`) 시 배식 로그 목록에서 소거되나 `mealStats`(메뉴별 배식 수량, 알레르기 학생 수 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 학년 필터를 `1학년`(3초 지연) → `2학년`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 1학년 결과가 최신 2학년 학생 목록을 덮어써 학생 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 영양사 A(김영양)에서 영양사 B(이조리)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 대체식 대기 수(`cachedSubPendingCount`) 및 최근 학생 알림(`cachedRecentStudent`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 대체식 승인 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `SUBSTITUTE MEAL APPROVED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 학생 정보 수정(이름, 학년반, 알레르기) 동시 수정 시 백엔드는 이름과 알레르기 항목만 저장하고 학년반은 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `승인완료 변경 + 즉시 식단 변경 (Error 1)` 클릭 ➔ 0.1초 후 식단 변경 완료 ➔ 3초 후 승인완료 변경 완료 ➔ 새로고침 시 식단이 롤백됨 확인.
2. **Error 2**: `⚡ 신청 취소 후 배식 완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 신청 취소(CANCELLED) ➔ 4초 후 배식 완료가 SERVED로 복원됨 확인.
3. **Error 3**: 좌측 `알레르기 위험도 높은순` 정렬 선택 ➔ 최상단 학생 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 학생 데이터 표시됨 확인.
4. **Error 4**: 배식 이력 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 배식 로그 목록에서 소거 ➔ 메뉴별 배식 수량 수치 변경되지 않음 확인.
5. **Error 5**: 학년 필터를 `1학년` → 즉시 `2학년`으로 변경 ➔ 3초 후 1학년 결과가 2학년 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김영양(A)` → `이조리(B)`으로 전환 ➔ 목록은 갱신되나 상단 대체식 대기 수치는 A 캐시(12건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 대체식 승인 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 SUBSTITUTE MEAL APPROVED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 학생 정보 수정 > 이름, 학년반, 알레르기 항목 수정 후 `학생 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 학년반만 이전 값 유지됨 확인.
