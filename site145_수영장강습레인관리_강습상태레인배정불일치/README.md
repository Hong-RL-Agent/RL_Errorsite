# SwimClass (site145_수영장강습레인관리_강습상태레인배정불일치)

시립 수영장 강습반, 전문 강사, 레인 배정 및 출석률 관리 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5245`

---

## 🏗️ 디렉토리 구조

```
site145_수영장강습레인관리_강습상태레인배정불일치
├─ frontend (React + Vite, Port: 5245)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9644)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9644`
- **Frontend 화면**: `http://localhost:5245`

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

- **수영 강습 회원 대장**: 70명의 강습 회원(회원 코드, 성명, 수강 강습반명, 강습 레벨, 배정 레인, 담당 강사, 출석률) 관제.
- **레인 배치 & 수영 강사**: 30개 강습반 & 20개 수영장 레인 배치 & 15명 전문 수영 강사 명단 관리.
- **출석 체크 & 감사 이력**: 90건의 락커키/바코드 출석 체킹 기록 & 90건의 수영장 관제 통합 감사 이력 관제.
- **강습 진행 상태**: 접수중(OPEN), 진행중(IN_PROGRESS), 출석완료(ATTENDED), 종료됨(COMPLETED), 취소됨(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 강습 상태를 진행중(IN_PROGRESS - 3초 지연 완료)으로 변경 직후 레인을 변경(0.1초 완료)하면, 레인 변경 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 레인)을 덮어써 저장됩니다. 새로고침 시 강습 상태와 상세 패널의 레인이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 강습 취소 API(0.5초 완료) 직후 출석 처리 API(4초 지연 완료) 호출 시, 강습 취소는 성공하지만 늦게 완료된 출석 처리 요청이 취소된 강습을 다시 `ATTENDED`(출석완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 회원 목록을 출석률 높은 순 또는 강습 등록일 빠른 순으로 정렬 후 상세 버튼 클릭 시 `sortedMembers` 배열 대신 원본 `members[]` 배열의 같은 인덱스 회원이 선택됩니다.

4. **통계 집계 불일치**
   - 출석 로그 삭제(`DELETE /api/attendance-logs/:id`) 시 출석 로그 목록에서 소거되나 `swimStats`(강습반별 출석률, 강사별 수업 수, 레인별 이용률 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 강습 레벨 필터를 `상급 (ADVANCED)`(3초 지연) → `중급 (INTERMEDIATE)`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 상급반 결과가 최신 중급반 목록을 덮어써 회원 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 직원 A(김수영)에서 직원 B(이레인)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 무단 결석 수(`cachedAbsenceCount`) 및 최근 회원 알림(`cachedRecentMember`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 강사가 레인 변경 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `SWIM LANE CHANGED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 회원 정보 수정(이름, 강습레벨, 연락처) 동시 수정 시 백엔드는 이름과 강습레벨만 저장하고 연락처는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `진행중 변경 + 즉시 레인 변경 (Error 1)` 클릭 ➔ 0.1초 후 레인 변경 완료 ➔ 3초 후 진행중 변경 완료 ➔ 새로고침 시 레인이 롤백됨 확인.
2. **Error 2**: `⚡ 강습 취소 후 출석 처리 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 강습 취소(CANCELLED) ➔ 4초 후 출석 처리가 ATTENDED로 복원됨 확인.
3. **Error 3**: 좌측 `출석률 높은 순` 정렬 선택 ➔ 최상단 회원 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 회원 데이터 표시됨 확인.
4. **Error 4**: 출석 체크 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 출석 로그 목록에서 소거 ➔ 강습반별 출석률 수치 변경되지 않음 확인.
5. **Error 5**: 강습 레벨 필터를 `상급 (ADVANCED)` → 즉시 `중급 (INTERMEDIATE)`으로 변경 ➔ 3초 후 상급반 결과가 중급반 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김수영(A)` → `이레인(B)`으로 전환 ➔ 목록은 갱신되나 상단 결석자 수치는 A 캐시(6명) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 강사의 레인 변경 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 SWIM LANE CHANGED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 회원 정보 수정 > 이름, 강습레벨, 연락처 수정 후 `회원 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 연락처만 이전 값 유지됨 확인.
