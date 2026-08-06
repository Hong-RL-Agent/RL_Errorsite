# CareerReview (site121_포트폴리오심사관리_심사상태평가점수불일치)

지원자 포트폴리오 제출, 심사 평가, 채용 점수 통합 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5221`

---

## 🏗️ 디렉토리 구조

```
site121_포트폴리오심사관리_심사상태평가점수불일치
├─ frontend (React + Vite, Port: 5221)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9620)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9620`
- **Frontend 화면**: `http://localhost:5221`

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

- **지원자 대장**: 45명 지원자(지원 직무, 경력 연차, 평가 점수, 포트폴리오 제목) 관제.
- **심사위원 & 평가표**: 15명 전문 심사위원 & 60건의 항목별 평가표(유용성, 비주얼, 논리성) 관제.
- **코멘트 타임라인**: 80건의 심사위원 피드백 코멘트 관리.
- **감사 및 레포트**: 90건의 심사 활동 감사 로그, 합격률 및 평균 점수 통계 관리.
- **심사 상태**: 제출완료(SUBMITTED), 심사배정(ASSIGNED), 심사중(UNDER_REVIEW), 보류(HOLD), 합격(PASSED), 불합격(FAILED), 지원취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 심사 상태를 합격(PASSED - 3초 지연 완료)으로 변경 직후 평가 점수를 수정(0.1초 완료)하면, 점수 수정 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 점수)을 덮어써 저장됩니다. 새로고침 시 지원자 목록의 점수와 상세 패널의 점수가 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 지원 취소 API(0.5초 완료) 직후 평가 코멘트 작성 API(4초 지연 완료) 호출 시, 지원 취소는 성공하지만 늦게 완료된 코멘트 작성 요청이 취소된 지원을 다시 `UNDER_REVIEW`(심사중) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 지원자 목록을 평가 점수순으로 정렬 후 상세 버튼 클릭 시 `sortedApplicants` 배열 대신 원본 `applicants[]` 배열의 같은 인덱스 지원자가 선택됩니다.

4. **통계 집계 불일치**
   - 평가 데이터 삭제(`DELETE /api/evaluations/:id`) 시 평가 목록에서 소거되나 `reviewStats`(직무별 평균 점수, 심사위원 처리량 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 직무 필터를 `UX/UI 디자인`(3초 지연) → `프론트엔드 개발`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 UX/UI 결과가 최신 프론트엔드 지원자 목록을 덮어써 지원자 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 심사위원 A(김디자인)에서 심사위원 B(이개발)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 미심사 대기 수(`cachedPendingCount`) 및 최근 평가 알림(`cachedRecentApplicant`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 심사위원이 최종 합격 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `FINAL PASS APPROVED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 지원자 정보 수정(성명, 희망직무, 연락처) 동시 수정 시 백엔드는 성명과 연락처만 저장하고 희망직무는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `합격 변경 + 즉시 평가 점수 수정 (Error 1)` 클릭 ➔ 0.1초 후 점수 수정 완료 ➔ 3초 후 합격 변경 완료 ➔ 새로고침 시 평가 점수가 롤백됨 확인.
2. **Error 2**: `⚡ 지원 취소 후 심사 코멘트 작성 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 지원 취소(CANCELLED) ➔ 4초 후 코멘트 작성이 UNDER_REVIEW로 복원됨 확인.
3. **Error 3**: 좌측 `평가 점수 높은순` 정렬 선택 ➔ 최상단 지원자 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 지원자 데이터 표시됨 확인.
4. **Error 4**: 평가 점수표 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 평가 목록에서 소거 ➔ 직무별 평균 점수 수치 변경되지 않음 확인.
5. **Error 5**: 직무 필터를 `UX/UI 디자인` → 즉시 `프론트엔드 개발`로 변경 ➔ 3초 후 UX/UI 결과가 프론트엔드 목록을 덮어씀 확인.
6. **Error 6**: 상단 심사위원을 `김디자인(A)` → `이개발(B)`으로 전환 ➔ 목록은 갱신되나 상단 미심사 수치는 A 캐시(15명) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 심사위원의 최종 합격 강제 승인 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 FINAL PASS APPROVED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 지원자 정보 수정 > 성명, 희망직무, 연락처 수정 후 `지원자 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 희망직무만 이전 값 유지됨 확인.
