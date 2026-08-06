# CertiExam (site139_자격증시험접수채점관리_응시상태점수불일치)

자격증 시험 접수, CBT 고사장 배정, 채점 결과 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5239`

---

## 🏗️ 디렉토리 구조

```
site139_자격증시험접수채점관리_응시상태점수불일치
├─ frontend (React + Vite, Port: 5239)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9638)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9638`
- **Frontend 화면**: `http://localhost:5239`

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

- **자격검정 응시자 대장**: 70명의 응시자(수험번호, 응시자 성명, 응시 과목, 배정 CBT 고사장, 접수일, 채점점수) 관제.
- **시험 과목 & CBT 고사장**: 15개 시험 과목 & 12개 권한별 CBT 고사장 인원 배정 관리.
- **CBT 채점 결과 & 감사 로그**: 55건의 실시간 CBT 점수 합산 내역 & 90건의 자격검정 통합 감사 이력 관제.
- **응시/채점 진행 상태**: 접수완료(REGISTERED), 응시중(IN_EXAM), 응시완료(COMPLETED), 채점완료(SCORED), 합격(PASSED), 불합격(FAILED), 접수취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 응시 상태를 응시완료(COMPLETED - 3초 지연 완료)로 변경 직후 점수를 수정(0.1초 완료)하면, 점수 수정 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 점수)을 덮어써 저장됩니다. 새로고침 시 응시 상태와 상세 패널의 점수가 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 접수 취소 API(0.5초 완료) 직후 채점 완료 API(4초 지연 완료) 호출 시, 접수 취소는 성공하지만 늦게 완료된 채점 완료 요청이 취소된 접수를 다시 `SCORED`(채점완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 응시자 목록을 취득 점수순 또는 접수일시순으로 정렬 후 상세 버튼 클릭 시 `sortedExaminees` 배열 대신 원본 `examinees[]` 배열의 같은 인덱스 응시자가 선택됩니다.

4. **통계 집계 불일치**
   - 채점 로그 삭제(`DELETE /api/scores/:id`) 시 채점 로그 목록에서 소거되나 `examStats`(과목별 평균 점수, 시험장 응시율, 합격률 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 과목 필터를 `정보처리기사 (실기)`(3초 지연) → `빅데이터분석기사`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 정보처리기사 결과가 최신 빅데이터분석기사 목록을 덮어써 응시자 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 감독관 A(김감독)에서 감독관 B(이채점)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 미채점 수(`cachedUnscoredCount`) 및 최근 응시자 알림(`cachedRecentExaminee`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 합격 처리 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `EXAM PASS CONFIRMED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 응시자 정보 수정(이름, 연락처, 시험장) 동시 수정 시 백엔드는 이름과 시험장만 저장하고 연락처는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `응시완료 변경 + 즉시 점수 수정 (Error 1)` 클릭 ➔ 0.1초 후 점수 수정 완료 ➔ 3초 후 응시완료 변경 완료 ➔ 새로고침 시 점수가 롤백됨 확인.
2. **Error 2**: `⚡ 접수 취소 후 채점 완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 접수 취소(CANCELLED) ➔ 4초 후 채점 완료가 SCORED로 복원됨 확인.
3. **Error 3**: 좌측 `취득 점수 높은 순` 정렬 선택 ➔ 최상단 응시자 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 응시자 데이터 표시됨 확인.
4. **Error 4**: 채점 결과 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 채점 로그 목록에서 소거 ➔ 과목별 평균 점수 수치 변경되지 않음 확인.
5. **Error 5**: 과목 필터를 `정보처리기사 (실기)` → 즉시 `빅데이터분석기사`로 변경 ➔ 3초 후 정보처리기사 결과가 빅데이터분석기사 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김감독(A)` → `이채점(B)`으로 전환 ➔ 목록은 갱신되나 상단 미채점 수치는 A 캐시(16건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 자격증 합격 확정 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 EXAM PASS CONFIRMED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 응시자 정보 수정 > 이름, 연락처, 시험장 수정 후 `응시자 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 연락처만 이전 값 유지됨 확인.
