# MealPass (site086_구내식당식권메뉴관리_식권수량메뉴예약불일치)

사내 구내식당 메뉴 예약, 식권 구매 및 사용 관리 포털 웹 애플리케이션

## 🏗️ 디렉토리 및 프로젝트 구조

```
site086_구내식당식권메뉴관리_식권수량메뉴예약불일치
├─ frontend (React + Vite, Port: 5186)
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
├─ backend (Node.js + Express, Port: 9585)
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

- **Backend API**: `http://localhost:9585`
- **Frontend 화면**: `http://localhost:5186`

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

## 📋 정상 기능 요약

- **구내식당 메뉴 조회**: 25개 이상의 한식, 일식, 중식, 양식, 샐러드 코너별 메뉴 칼로리/인기도 확인.
- **메뉴 사전 예약**: 점심/저녁 선호 메뉴 수량 지정 예약 및 예약 변경/취소.
- **모바일 식권 구매 & 사용**: 30개 이상의 사원별 보유 식권 및 타임라인 차감 내역.
- **실시간 식당 혼잡도 모니터링**: 제1식당, 제2식당, 제3식당의 SVG 혼잡도 막대 그래프 모니터링.

---

## ⚠️ 의도적으로 삽입된 복합 오류 목록

1. **Frontend + Backend 요청 순서 충돌**
   - **설명**: 메뉴 예약 수량을 변경(3초 지연 완료)한 직후 예약 메뉴를 변경(0.1초 완료)하면, 메뉴 변경 API는 먼저 성공하지만 3초 뒤 완료되는 수량 변경 API 내부에 이전 메뉴 ID(`menuId`, `menuName`)가 동봉 저장되어 새로고침 시 새 수량과 이전 메뉴 조합이 저장됩니다.

2. **Backend + JSON DB 상태 충돌**
   - **설명**: 메뉴 예약 취소(0.5초 완료) 직후 식권 사용 API를 호출(4초 지연 완료)하면, 예약 취소는 먼저 0.5초 만에 성공하지만 늦게 완료된 식권 사용 요청이 취소된 예약을 다시 'USED'(사용완료) 상태로 재활성화시킵니다. 내 예약 목록에서는 취소됨, 식권 사용 내역에서는 사용완료로 불일치하게 됩니다.

3. **Frontend 정렬 인덱스 오류**
   - **설명**: 메뉴 목록을 인기순으로 정렬한 뒤 예약 버튼을 누르면 UI 알림은 클릭한 메뉴명으로 표시되나 backend 저장 예약 데이터는 원본 배열의 다른 index 메뉴 id로 저장됩니다.

4. **통계 데이터 불일치**
   - **설명**: 메뉴 예약을 삭제(`DELETE /api/reservations/:id`) 처리하여 대장에서 소거하더라도, 메뉴별 예약 수량과 식당별 정산 통계(`cafeteriaStats.totalReservationsCount`) 수치에는 차감되지 않고 계속 유지됩니다.

5. **Network stale response 오류**
   - **설명**: 식당 필터('CAFETERIA_1' 3초 지연 ➔ 'CAFETERIA_2' 0.2초 완료)와 메뉴 유형 필터를 빠르게 변경 시 오래된 응답이 최신 목록을 덮어써 중앙 메뉴 목록은 오래된 필터 결과, 오른쪽 식권 요약은 최신 필터 기준 데이터로 서로 불일치합니다.

6. **Session + Cache 잔존 오류**
   - **설명**: 직원 A의 식권 내역을 본 뒤 직원 B로 로그인하면 식권 목록은 B 권한 기준으로 바뀌지만, 상단 잔여 식권 수 및 다음 예약 요약 캐시(`cachedRemainingTickets`, `cachedNextReservation`)는 A 데이터가 남아 노출됩니다.

7. **Backend 권한 로그 오류**
   - **설명**: 권한 없는 직원(role !== 'ADMIN')이 관리자 메뉴 삭제 API(`DELETE /api/menus/:id`)를 호출하면 HTTP 403을 반환하지만, 서버 내부 활동 로그에는 '메뉴 삭제 성공 (MENU DELETE SUCCESS - 200 OK)'으로 잘못 기록됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1 테스트**: 우측 패널에서 수량 선택 후 `수량 변경` 클릭 직후 메뉴 선택 변경 ➔ 3초 후 새로고침 시 수량은 바뀌었으나 메뉴는 이전 메뉴로 롤백됨을 확인.
2. **Error 2 테스트**: 우측 패널에서 `⚡ 예약 취소 후 식권 사용` 클릭 ➔ 0.5초 후 취소 응답 ➔ 4초 후 식권 사용 응답이 완료되며 내 예약 목록(취소됨)과 식권 사용 내역(사용완료) 간 상태 불일치 확인.
3. **Error 3 테스트**: 좌측 사이드바에서 `인기높은순` 정렬 선택 ➔ 상단 메뉴의 예약 클릭 ➔ UI 알림과 실제 backend DB 저장 메뉴 id가 상이함을 확인.
4. **Error 4 테스트**: 중앙 예약 대장에서 `🗑️ 취소/삭제` 클릭 ➔ 대장에서는 삭제되나 메뉴별 예약 수량 및 식당 정산 금액 수치가 유지됨을 확인.
5. **Error 5 테스트**: 좌측 식당 필터를 `제1구내식당` 선택 직후 `제2구내식당` 선택 ➔ 3초 후 늦은 이전 결과가 최신 목록을 덮어씀을 확인.
6. **Error 6 테스트**: 상단 로그인 사원을 `김철수 팀장`에서 `이영희 수석`으로 전환 ➔ 식권 내역은 B로 바뀌나 상단 KPI 잔여 식권 수량은 A 데이터로 잔존함을 확인.
7. **Error 7 테스트**: 중앙 탭에서 `🔒 관리자 메뉴 무권한 삭제` 클릭 ➔ UI/API는 HTTP 403 오류 반환 ➔ 백엔드 콘솔 로그에는 SUCCESS (200 OK)로 잘못 작성됨을 확인.
