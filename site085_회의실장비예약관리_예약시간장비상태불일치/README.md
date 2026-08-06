# RoomEquip (site085_회의실장비예약관리_예약시간장비상태불일치)

회사 회의실, 빔프로젝터, 노트북 등 공용 장비 예약 관리 포털 웹 애플리케이션

## 🏗️ 디렉토리 및 프로젝트 구조

```
site085_회의실장비예약관리_예약시간장비상태불일치
├─ frontend (React + Vite, Port: 5185)
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
├─ backend (Node.js + Express, Port: 9584)
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

- **Backend API**: `http://localhost:9584`
- **Frontend 화면**: `http://localhost:5185`

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

- **회의실 배치도 & 시간표**: 15개 이상의 1~5층 회의실 수용 인원 및 고정 설치 장비 조회.
- **공용 장비 대여 관리**: 25개 이상의 빔프로젝터, 노트북, 화상회의 세트, 음향 장비 대여 신청.
- **내 예약 현황 관리**: 30개 이상의 사원별 회의실 및 장비 예약 일시 변경/취소.
- **관리자 장비 점검표**: 공용 장비 점검 상태 및 누적 사용 횟수 모니터링.

---

## ⚠️ 의도적으로 삽입된 복합 오류 목록

1. **Frontend + Backend 요청 순서 충돌**
   - **설명**: 회의실 예약 시간을 변경(3초 지연 완료)한 직후 장비를 추가(0.1초 완료)하면, 장비 추가 API는 먼저 성공하지만 3초 뒤 완료되는 시간 변경 API 내부에 이전 장비 목록(`equipments`)이 동봉 저장되어 새로고침 시 새 시간과 이전 장비 목록 조합이 저장됩니다.

2. **Backend + JSON DB 상태 충돌**
   - **설명**: 예약 취소(0.5초 완료) 직후 장비 반납 처리 API를 호출(4초 지연 완료)하면, 예약 취소는 먼저 0.5초 만에 성공하지만 늦게 완료된 반납 처리 요청이 취소된 예약을 다시 'COMPLETED'(사용완료) 상태로 재활성화시킵니다. 내 예약 목록에서는 취소됨, 관리자 통계에서는 사용완료로 불일치하게 됩니다.

3. **Frontend 정렬 인덱스 오류**
   - **설명**: 장비 목록을 사용가능순으로 정렬한 뒤 예약 버튼을 누르면 UI 알림은 클릭한 장비명으로 표시되나 backend 저장 예약 데이터는 원본 배열의 다른 index 장비 id로 저장됩니다.

4. **통계 데이터 불일치**
   - **설명**: 장비 예약을 삭제(`DELETE /api/reservations/:id`) 처리하여 대장에서 소거하더라도, 장비별 사용 횟수와 월별 사용 통계(`usageStats.totalReservationsCount`) 수치에는 차감되지 않고 계속 유지됩니다.

5. **Network stale response 오류**
   - **설명**: 층 필터('3층' 3초 지연 ➔ '2층' 0.2초 완료)와 장비 유형 필터를 빠르게 변경 시 오래된 응답이 최신 목록을 덮어써 중앙 회의실 목록은 오래된 필터 결과, 오른쪽 예약 요약은 최신 필터 기준 데이터로 서로 불일치합니다.

6. **Session + Cache 잔존 오류**
   - **설명**: 직원 A의 예약 내역을 본 뒤 직원 B로 로그인하면 예약 목록은 B 권한 기준으로 바뀌지만, 상단 예약 건수 및 다음 회의실 요약 캐시(`cachedReservationCount`, `cachedNextRoomSummary`)는 A 데이터가 남아 노출됩니다.

7. **Backend 권한 로그 오류**
   - **설명**: 권한 없는 직원(role !== 'ADMIN')이 장비 상태 변경 API(`PATCH /api/equipments/:id/status`)를 호출하면 HTTP 403을 반환하지만, 서버 내부 활동 로그에는 '장비 상태 변경 성공 (EQUIPMENT STATUS UPDATE SUCCESS - 200 OK)'으로 잘못 기록됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1 테스트**: 우측 패널에서 예약 일자 선택 후 `시간 변경` 클릭 직후 추가 장비 선택 ➔ 3초 후 새로고침 시 시간은 바뀌었으나 장비 목록은 이전 상태로 롤백됨을 확인.
2. **Error 2 테스트**: 우측 패널에서 `⚡ 예약 취소 후 장비 반납` 클릭 ➔ 0.5초 후 취소 응답 ➔ 4초 후 장비 반납 응답이 완료되며 내 예약 목록(취소됨)과 관리자 통계(사용완료) 간 상태 불일치 확인.
3. **Error 3 테스트**: 좌측 사이드바에서 `사용가능순` 정렬 선택 ➔ 상단 장비의 예약 클릭 ➔ UI 알림과 실제 backend DB 저장 장비 id가 상이함을 확인.
4. **Error 4 테스트**: 중앙 예약 대장에서 `🗑️ 취소/삭제` 클릭 ➔ 대장에서는 삭제되나 장비별 사용 횟수 수치가 유지됨을 확인.
5. **Error 5 테스트**: 좌측 층 필터를 `3층` 선택 직후 `2층` 선택 ➔ 3초 후 늦은 이전 결과가 최신 목록을 덮어씀을 확인.
6. **Error 6 테스트**: 상단 로그인 사원을 `김철수 팀장`에서 `이영희 수석`으로 전환 ➔ 예약 목록은 B로 바뀌나 상단 KPI 내 예약 건수는 A 데이터로 잔존함을 확인.
7. **Error 7 테스트**: 중앙 탭에서 `🔒 무권한 직원의 장비 상태 변경` 클릭 ➔ UI/API는 HTTP 403 오류 반환 ➔ 백엔드 콘솔 로그에는 SUCCESS (200 OK)로 잘못 작성됨을 확인.
