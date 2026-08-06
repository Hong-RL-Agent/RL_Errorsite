# CultureClass (site153_문화센터강좌운영관리_강좌상태수강인원불일치)

지역 문화센터 강좌 기획, 수강신청, 출석 및 강의실 배정 관리 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5253`

---

## 🏗️ 디렉토리 구조

```
site153_문화센터강좌운영관리_강좌상태수강인원불일치
├─ frontend (React + Vite, Port: 5253)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9652)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9652`
- **Frontend 화면**: `http://localhost:5253`

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

- **문화센터 개설 강좌 대장**: 40개 개설 강좌(강좌 코드, 카테고리, 강좌명, 담당 강사명, 배정 강의실, 개강 시작일, 수강인원, 수강료) 관제.
- **전문 강사 & 수강생**: 20명 초빙 강사 & 80명 수강생 인적사항 명단 및 70건의 수강신청 등록 현황 관리.
- **출석 로그 & 감사 이력**: 100건의 강의실 출석 실시간 체크 로그 & 90건의 문화센터 관제 통합 감사 이력 관제.
- **강좌 진행 상태**: 모집중(RECRUITING), 모집마감(CLOSED), 강의중(IN_SESSION), 종강완료(COMPLETED), 폐강(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 강좌 상태를 모집마감(CLOSED - 3초 지연 완료)으로 변경 직후 수강 인원을 수정(0.1초 완료)하면, 수강 인원 수정 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 수강 인원)을 덮어써 저장됩니다. 새로고침 시 강좌 상태와 상세 패널의 수강 인원이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 수강 취소 API(0.5초 완료) 직후 출석 처리 API(4초 지연 완료) 호출 시, 수강 취소는 성공하지만 늦게 완료된 출석 처리 요청이 취소된 수강생을 다시 `ATTENDED`(출석완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 강좌 목록을 신청 인원 많은 순 또는 개강 시작일 빠른 순으로 정렬 후 상세 버튼 클릭 시 `sortedCourses` 배열 대신 원본 `courses[]` 배열의 같은 인덱스 강좌가 선택됩니다.

4. **통계 집계 불일치**
   - 출석 로그 삭제(`DELETE /api/attendance-logs/:id`) 시 출석 로그 목록에서 소거되나 `cultureStats`(강좌별 출석률, 강사별 수업 수, 카테고리별 신청률 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 카테고리 필터를 `인문학 & 서양 미술사`(3초 지연) → `음악 & 바이올린 클래스`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 인문학 결과가 최신 음악 클래스 목록을 덮어써 강좌 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 직원 A(김문화)에서 직원 B(이강좌)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 모집마감 수(`cachedClosedCount`) 및 최근 강좌 알림(`cachedRecentCourse`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 강좌 폐강 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `CULTURE COURSE CANCELLED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 강좌 정보 수정(강좌명, 강사명, 강의실) 동시 수정 시 백엔드는 강좌명과 강사명만 저장하고 강의실은 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `모집마감 변경 + 즉시 수강 인원 조정 (Error 1)` 클릭 ➔ 0.1초 후 수강 인원 조정 완료 ➔ 3초 후 모집마감 변경 완료 ➔ 새로고침 시 수강 인원이 롤백됨 확인.
2. **Error 2**: `⚡ 수강 취소 후 출석 처리 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 수강 취소(CANCELLED) ➔ 4초 후 출석 처리가 ATTENDED로 복원됨 확인.
3. **Error 3**: 좌측 `신청 인원 많은 순` 정렬 선택 ➔ 최상단 강좌 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 강좌 데이터 표시됨 확인.
4. **Error 4**: 출석 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 출석 로그 목록에서 소거 ➔ 강좌별 출석률 수치 변경되지 않음 확인.
5. **Error 5**: 카테고리 필터를 `인문학 & 서양 미술사` → 즉시 `음악 & 바이올린 클래스`로 변경 ➔ 3초 후 인문학 결과가 음악 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김문화(A)` → `이강좌(B)`으로 전환 ➔ 목록은 갱신되나 상단 마감 강좌 수치는 A 캐시(18개) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 강좌 폐강 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 CULTURE COURSE CANCELLED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 강좌 정보 수정 > 강좌명, 강사명, 강의실 수정 후 `강좌 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 강의실만 이전 값 유지됨 확인.
