# BroadcastBoard (site117_방송편성광고송출관리_편성상태광고시간불일치)

방송 프로그램 편성, 광고 슬롯, 송출 상태 통합 관리 관제 콘솔

## 🌐 브라우저 접속 주소
`http://localhost:5217`

---

## 🏗️ 디렉토리 구조

```
site117_방송편성광고송출관리_편성상태광고시간불일치
├─ frontend (React + Vite, Port: 5217)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9616)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9616`
- **Frontend 화면**: `http://localhost:5217`

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

- **방송 편성 대장**: 60건의 채널별 프로그램 편성 데이터(방송시간, 배정 광고주, 송출상태) 관제.
- **채널 및 카탈로그**: 8개 방송 채널 & 40개 프로그램 카탈로그 관제.
- **광고 슬롯 현황**: 50개 광고 슬롯(프라임 타임, 중간광고, 광고주 단가) 관리.
- **송출 및 활동 로그**: 80건의 주조정실 실제 송출 완료 로그, 80건의 감사 활동 로그 관리.
- **편성 상태**: 초안(DRAFT), 검토중(REVIEWING), 편성확정(CONFIRMED), 송출대기(READY), 송출중(ON_AIR), 송출완료(COMPLETED), 취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 편성 시간을 변경(3초 지연 완료) 직후 광고 슬롯을 변경(0.1초 완료)하면, 광고 슬롯 API는 먼저 완료되나 3초 뒤 완료되는 편성 시간 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 광고 슬롯)을 덮어써 저장됩니다. 새로고침 시 편성표의 광고 슬롯과 상세 패널의 광고 슬롯이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 편성 취소 API(0.5초 완료) 직후 송출 완료 API(4초 지연 완료) 호출 시, 편성 취소는 성공하지만 늦게 완료된 송출 완료 요청이 취소된 편성을 다시 `COMPLETED`(송출완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 프로그램 목록을 시청률순으로 정렬 후 편성 버튼 클릭 시 `sortedSchedules` 배열 대신 원본 `schedules[]` 배열의 같은 인덱스 편성이 선택됩니다.

4. **통계 집계 불일치**
   - 송출 로그 삭제(`DELETE /api/broadcast-logs/:id`) 시 로그 목록에서 소거되나 `broadcastStats`(광고 송출률, 시간대별 시청률 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 채널 필터를 `CH-01`(3초 지연) → `CH-02`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 CH-01 결과가 최신 CH-02 편성표를 덮어써 편성표와 오른쪽 송출 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 관리자 A(김편성)에서 관리자 B(이광고)로 전환 시 편성 목록은 B 권한 기준으로 갱신되나, 상단 송출대기 수(`cachedReadyCount`) 및 최근 편성 알림(`cachedRecentSchedule`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 송출확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `SCHEDULE CONFIRMED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 프로그램 정보 수정(제목, 방송시간, 등급) 동시 수정 시 백엔드는 제목과 등급만 저장하고 방송시간은 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `편성 시간 변경 + 즉시 광고 슬롯 변경 (Error 1)` 클릭 ➔ 0.1초 후 광고 슬롯 변경 완료 ➔ 3초 후 편성 시간 변경 완료 ➔ 새로고침 시 광고 슬롯이 롤백됨 확인.
2. **Error 2**: `⚡ 편성 취소 후 송출 완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 편성 취소(CANCELLED) ➔ 4초 후 송출 완료가 COMPLETED로 복원됨 확인.
3. **Error 3**: 좌측 `시청률 높은순` 정렬 선택 ➔ 최상단 편성 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 편성 데이터 표시됨 확인.
4. **Error 4**: 송출 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 송출 로그 목록에서 소거 ➔ 광고 송출률 수치 변경되지 않음 확인.
5. **Error 5**: 채널 필터를 `CH-01` → 즉시 `CH-02`로 변경 ➔ 3초 후 CH-01 결과가 CH-02 목록을 덮어씀 확인.
6. **Error 6**: 상단 관리자를 `김편성(A)` → `이광고(B)`으로 전환 ➔ 편성 목록은 갱신되나 상단 송출대기 수치는 A 캐시(18건) 잔존 확인.
7. **Error 7**: 송출 로그 탭 > `🔒 권한 없는 직원의 송출확정 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 SCHEDULE CONFIRMED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 프로그램 정보 수정 > 제목, 방송시간, 등급 수정 후 `프로그램 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 방송시간만 이전 값 유지됨 확인.
