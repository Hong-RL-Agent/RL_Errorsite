# PortStack (site111_항만컨테이너선적관리_컨테이너상태선박배정불일치)

항만 컨테이너 반입, 야드 배치, 선박 선적 통합 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5211`

---

## 🏗️ 디렉토리 구조

```
site111_항만컨테이너선적관리_컨테이너상태선박배정불일치
├─ frontend (React + Vite, Port: 5211)
│  ├─ package.json
│  ├─ index.html
│  ├─ vite.config.js
│  └─ src
│     ├─ main.jsx
│     ├─ App.jsx
│     ├─ api/index.js
│     ├─ components
│     │  ├─ Header.jsx
│     │  ├─ Sidebar.jsx
│     │  ├─ CenterSection.jsx
│     │  └─ RightPanel.jsx
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9610)
│  ├─ package.json
│  ├─ server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9610`
- **Frontend 화면**: `http://localhost:5211`

### 실행 방법 (서로 다른 터미널에서 실행)

1. **백엔드 실행**:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **프론트엔드 실행**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📋 정상 기능 요약

- **항만 대시보드**: 컨테이너 60개, 선박 15척, 야드 40블록(A~E구역), 선적 작업 로그 90건 관제.
- **컨테이너 목록 & 검색**: 컨테이너번호/목적지/야드구역 필터 및 정렬, 위험물/일반화물 분류.
- **야드 배치도**: A~E구역 각 8블록을 CSS Grid로 점유율 시각화 (위험/보통/여유 색상 구분).
- **선박 선적 관제**: 15척 선박별 TEU 수용량, 적재율, ETA 현황 관리.
- **직원 & 활동 로그 관리**: 15명 항만 직원의 처리량 및 90건 선적 작업 감사 로그 관리.

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 야드 위치 변경(3초 지연 완료) 직후 선박 배정(0.1초 완료) 시, 선박 배정 API는 먼저 완료되나 3초 뒤 완료되는 야드 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 야드 위치)을 덮어써 저장됩니다. 새로고침 시 컨테이너 상세의 야드 위치와 야드 배치도의 위치가 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 반출 취소 API(0.5초 완료) 호출 직후 선적 완료 API(4초 지연 완료) 호출 시, 반출 취소는 성공하지만 늦게 완료된 선적 완료 요청이 취소된 컨테이너를 다시 `LOADED`(선적완료) 상태로 복원합니다. 컨테이너 목록에서는 `IN_YARD`, 선박 적재 현황에서는 `LOADED`로 불일치합니다.

3. **Frontend 정렬 인덱스 오류**
   - 컨테이너 목록을 도착시간순/위험물 우선순으로 정렬 후 상세 버튼 클릭 시 `sortedContainers` 배열 대신 원본 `containers[]` 배열의 같은 인덱스 컨테이너 상세가 열립니다.

4. **통계 집계 불일치**
   - 선적 작업 로그 삭제(`DELETE /api/loading-logs/:id`) 시 로그 대장에서 소거되나 선박별 적재율(`portStats`), 야드 점유율, 직원별 처리량 통계에는 삭제 전 수치가 계속 잔존합니다.

5. **Network stale response 오류**
   - 야드 구역 필터를 `A구역`(3초 지연) → `B구역`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 A구역 결과가 최신 B구역 컨테이너 목록을 덮어써 컨테이너 목록과 야드 배치도가 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 직원 A(김항만)에서 직원 B(이선적)로 로그인 전환 시 컨테이너 목록은 B 권한 기준으로 갱신되나, 상단 선적 대기 수(`cachedPending`) 및 최근 컨테이너 알림(`cachedRecentContainer`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 일반 직원이 선박 배정 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `VESSEL ASSIGNED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 컨테이너 정보 수정(무게, 위험물 여부, 목적지) 동시 수정 시 백엔드는 무게와 목적지만 저장하고 위험물 여부는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 관제 패널 > `야드 변경 후 즉시 선박 배정 (Error 1)` 클릭 ➔ 0.1초 후 선박 배정 완료 ➔ 3초 후 야드 변경 완료 ➔ 새로고침 시 이전 야드 위치로 롤백됨 확인.
2. **Error 2**: `⚡ 반출 취소 후 선적 완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 반출 취소(IN_YARD) ➔ 4초 후 선적 완료가 LOADED로 복원됨 확인.
3. **Error 3**: 좌측 `도착시간 빠른순` 정렬 선택 ➔ 최상단 컨테이너 `상세 (Error 3)` 클릭 ➔ 우측 패널에 다른 컨테이너 데이터 표시됨 확인.
4. **Error 4**: 중앙 탭 > 선적 작업 로그 > `🗑️ 삭제 (Error 4)` 클릭 ➔ 로그 목록에서 소거 ➔ 대시보드 KPI 수치 변경되지 않음 확인.
5. **Error 5**: 좌측 야드 구역 필터를 `A구역` → 즉시 `B구역`으로 변경 ➔ 3초 후 A구역 결과가 B구역 목록을 덮어씀 확인.
6. **Error 6**: 상단 로그인 직원을 `김항만(A)` → `이선적(B)`으로 변경 ➔ 컨테이너 목록은 갱신되나 상단 선적 대기 수는 A 캐시(18개) 잔존 확인.
7. **Error 7**: 선적 작업 로그 탭 > `🔒 권한 없는 직원의 선박 강제 배정 시도 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 VESSEL ASSIGNED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 패널 > 무게, 위험물 여부, 목적지 수정 후 `컨테이너 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 위험물 여부만 이전 값 유지됨 확인.
