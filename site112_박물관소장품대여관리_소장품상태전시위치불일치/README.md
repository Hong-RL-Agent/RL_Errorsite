# MuseumVault (site112_박물관소장품대여관리_소장품상태전시위치불일치)

박물관 소장품 전시 배치, 외부 대여, 보존 상태 통합 관리 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5212`

---

## 🏗️ 디렉토리 구조

```
site112_박물관소장품대여관리_소장품상태전시위치불일치
├─ frontend (React + Vite, Port: 5212)
│  ├─ package.json
│  ├─ index.html
│  ├─ vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components
│     │  ├─ Header.jsx / Sidebar.jsx / CenterSection.jsx / RightPanel.jsx
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9611)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9611`
- **Frontend 화면**: `http://localhost:5212`

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

- **소장품 대장**: 55개 소장품의 분류(도자/회화/금속/불교/민속 등), 시대(선사~근현대), 보존등급(S/A/B/C), 전시실 배치 관제.
- **전시실 배치도**: 10개 전시실(1F~3F & 지하 수장고)별 소장품 배치 점유율 CSS Grid 시각화.
- **외부 대여 관리**: 35건의 국내외 기관 대여 신청(승인/반려/취소/반납) 관제.
- **보존 상태 로그**: 80건의 학예사별 보존 점검 및 처리 감사 로그 관리.
- **학예사 12명** 담당 소장품 및 처리량 관리.

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 전시 위치 변경(3초 지연 완료) 직후 보존등급 변경(0.1초 완료) 시, 보존등급 변경 API는 먼저 완료되나 3초 뒤 완료되는 전시 위치 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 전시 위치)을 덮어써 저장됩니다. 새로고침 시 전시실 배치도와 소장품 상세의 위치가 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 대여 취소 API(0.5초 완료) 직후 반납 완료 API(4초 지연 완료) 호출 시, 대여 취소는 성공하지만 늦게 완료된 반납 완료 요청이 취소된 대여를 다시 `RETURNED`(반납 완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 소장품 목록을 제작연도순/보존등급순으로 정렬 후 상세 버튼 클릭 시 `sortedArtifacts` 배열 대신 원본 `artifacts[]` 배열의 같은 인덱스 소장품 상세가 열립니다.

4. **통계 집계 불일치**
   - 보존 상태 로그 삭제(`DELETE /api/conservation-logs/:id`) 시 로그 목록에서 소거되나 `museumStats`(보존등급별 개수, 학예사별 처리량 등) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 전시실 필터를 `제3전시실`(3초 지연) → `제1전시실`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 제3전시실 결과가 최신 제1전시실 소장품 목록을 덮어써 소장품 목록과 우측 전시실 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 학예사 A(김고려)에서 학예사 B(이조선)로 전환 시 소장품 목록은 B 담당 기준으로 갱신되나, 상단 대여 대기 수(`cachedPendingLoans`) 및 최근 소장품 알림(`cachedRecentArtifact`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 대여 승인 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `LOAN APPROVED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 소장품 정보 수정(작품명, 제작연도, 보존등급) 동시 수정 시 백엔드는 작품명과 보존등급만 저장하고 제작연도는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 관제 패널 > 전시실 변경 후 `전시 위치 변경 + 즉시 보존등급 변경 (Error 1)` 클릭 ➔ 0.1초 후 보존등급 변경 완료 ➔ 3초 후 전시 위치 변경 완료 ➔ 새로고침 시 보존등급 변경이 롤백됨 확인.
2. **Error 2**: `⚡ 대여 취소 후 반납 완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 대여 취소(CANCELLED) ➔ 4초 후 반납 완료가 RETURNED로 복원됨 확인.
3. **Error 3**: 좌측 `제작연도 오래된순` 정렬 선택 ➔ 최상단 소장품 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 소장품 데이터 표시됨 확인.
4. **Error 4**: 보존 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 로그 목록에서 소거 ➔ 대시보드 보존등급 통계 수치 변경되지 않음 확인.
5. **Error 5**: 전시실 필터를 `제3전시실` → 즉시 `제1전시실`으로 변경 ➔ 3초 후 제3전시실 결과가 제1전시실 목록을 덮어씀 확인.
6. **Error 6**: 상단 학예사를 `김고려(A)` → `이조선(B)`으로 전환 ➔ 소장품 목록은 갱신되나 상단 대여 대기 수는 A 캐시(8건) 잔존 확인.
7. **Error 7**: 대여 신청 탭 > `🔒 권한 없는 직원의 대여 강제 승인 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 LOAN APPROVED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 소장품 정보 수정 패널 > 작품명, 제작연도, 보존등급 수정 후 `소장품 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 제작연도만 이전 값 유지됨 확인.
