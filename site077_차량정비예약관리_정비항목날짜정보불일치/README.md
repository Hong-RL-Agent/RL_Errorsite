# AutoCare (site077_차량정비예약관리_정비항목날짜정보불일치)

차량 정비 예약, 정비 이력 및 정비소 운영 관리 웹 애플리케이션

## 🏗️ 폴더 및 디렉토리 구조

```
site077_차량정비예약관리_정비항목날짜정보불일치
├─ frontend (React + Vite, Port: 5177)
│  ├─ package.json
│  ├─ index.html
│  ├─ vite.config.js
│  └─ src
│     ├─ main.jsx
│     ├─ App.jsx
│     ├─ index.css
│     ├─ api
│     │  └─ index.js
│     ├─ components
│     │  ├─ Header.jsx
│     │  ├─ Sidebar.jsx
│     │  ├─ CenterSection.jsx
│     │  └─ RightPanel.jsx
│     └─ pages
│        └─ Home.jsx
│
├─ backend (Node.js + Express, Port: 9576)
│  ├─ package.json
│  ├─ server.js
│  ├─ routes
│  │  └─ apiRoutes.js
│  ├─ controllers
│  │  └─ mainController.js
│  ├─ services
│  │  └─ dataService.js
│  └─ data
│     └─ data.json
│
└─ README.md
```

## 🚀 실행 포트 안내

- **Backend (Express API)**: `http://localhost:9576`
- **Frontend (React + Vite)**: `http://localhost:5177`

### 실행 방법 (서로 다른 터미널)

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

## ⚠️ 삽입된 복합 오류 요약

1. **Frontend + Backend: 정비 항목 변경 직후 예약 날짜 변경 시 구형 날짜로 덮어쓰기**
   - **설명**: 정비 항목을 변경(3초 지연 완료)한 직후 예약 날짜도 변경(0.1초 완료)하면, 날짜 변경 요청은 먼저 성공하지만 3초 뒤 완료되는 정비 항목 변경 요청 내부에 이전 구형 날짜(`date`)가 함께 저장되어 새로고침 시 새 정비 항목과 이전 날짜 조합이 들어가는 레이스 컨디션 결함입니다.

2. **Backend + Database: 예약 취소 직후 작업 상태 변경 시 대기 상태로 재부활**
   - **설명**: 예약 취소(0.5초 완료) 직후 작업 상태 변경(4초 지연 완료)을 수행하면, 취소 요청은 먼저 성공하지만 늦게 완료된 상태 변경 요청이 취소 완료된 예약을 다시 `'QUEUED'`(작업 대기) 상태로 강제 복구 부활시키는 결함입니다.

3. **Frontend: 정비소 목록 평점순 정렬 상태에서 예약 클릭 시 대상 인덱스 불일치**
   - **설명**: 정비소 목록을 평점순으로 정렬한 뒤 예약 버튼을 누르면, 화면의 정렬 인덱스를 원본 정비소 배열에 대입하여 선택한 정비소가 아닌 엉뚱한 다른 정비소로 즉시 예약 처리되는 결함입니다.

4. **Database: 정비 이력 삭제 시에도 차량별 총 정비 금액 및 통계 수치 누수 유지**
   - **설명**: 정비 이력을 삭제(`DELETE /api/reservations/:id`) 처리하더라도, 차량별 총 정비 금액(`vehicle.totalMaintenanceCost`) 및 관리자 매출 통계 수치에는 해당 정비 금액이 차감되지 않고 계속 포함 유지되는 결함입니다.

5. **Frontend + Network: 지역/항목 필터 고속 변경 시 늦은 이전 응답이 목록 덮어씀**
   - **설명**: 지역 필터('강남구' 3초 지연 ➔ '마포구' 0.2초 완료)를 고속 변경 시, 늦게 도착한 이전 응답(강남구)이 최신 목록을 덮어쓰고 오른쪽 견적 패널에는 다른 정비소 기준 가격이 노출되는 결함입니다.

6. **Session + Cache: 차주 계정 교환 시 차량 번호 및 정비 이력 캐시 잔존**
   - **설명**: 사용자 A의 차량 정보를 본 뒤 사용자 B로 로그인하면 예약 목록은 B 기준으로 리로드되나, 상단의 차량 번호 및 최근 정비 이력 캐시(`cachedCarNumber`, `cachedLastServiceItem`)는 갱신되지 않고 사용자 A 데이터가 그대로 남아 노출되는 결함입니다.

7. **Backend: 미권한 정비사의 작업 상태 변경 호출 시 HTTP 403 반환하나 감사 로그에는 성공 기록**
   - **설명**: 권한 없는 일반 정비사가 작업 상태 변경 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 활동 서버 로그(`activityLogs`)에는 상태 변경 시도가 정상 성공한 것으로 기록되는 보안/감사 결함입니다.
