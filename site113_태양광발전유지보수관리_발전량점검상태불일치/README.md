# SolarOps (site113_태양광발전유지보수관리_발전량점검상태불일치)

태양광 발전소 발전량 관제, 인버터 모니터링, 패널 유지보수 작업 관리 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5213`

---

## 🏗️ 디렉토리 구조

```
site113_태양광발전유지보수관리_발전량점검상태불일치
├─ frontend (React + Vite, Port: 5213)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9612)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9612`
- **Frontend 화면**: `http://localhost:5213`

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

- **태양광 패널 관제**: 80개 패널의 실시간 출력(kW), 표면 온도(℃), 핫스팟/주의/정상 상태 관제.
- **발전소 구역 대시보드**: 12개 발전 구역(A~D구역)별 발전 용량, 발전 효율(%), 핫스팟 발생 여부 배치도 시각화.
- **인버터 관제**: 20대 인버터 모듈의 실시간 출력, 변환 효율, 손실률 관제.
- **유지보수 작업 & 발전 로그**: 45건의 점검 작업, 100건의 발전량 측정 로그, 90건의 감사 이력 관리.
- **작업자 15명** 배정 및 처리 건수 관리.

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 패널 점검 상태를 점검완료(3초 지연 완료)로 변경 직후 담당 작업자를 변경(0.1초 완료)하면, 작업자 변경 API는 먼저 완료되나 3초 뒤 완료되는 점검 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 작업자)을 덮어써 저장됩니다. 새로고침 시 작업 목록의 담당자와 패널 상세의 담당자가 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 점검 작업 취소 API(0.5초 완료) 직후 발전량 보정 API(4초 지연 완료) 호출 시, 점검 취소는 성공하지만 늦게 완료된 발전량 보정 요청이 취소된 작업을 다시 `INSPECTING`(점검중) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 패널 목록을 발전량 낮은순/온도 높은순으로 정렬 후 상세 버튼 클릭 시 `sortedPanels` 배열 대신 원본 `panels[]` 배열의 같은 인덱스 패널 상세가 열립니다.

4. **통계 집계 불일치**
   - 발전량 로그 삭제(`DELETE /api/power-logs/:id`) 시 로그 목록에서 소거되나 `solarStats`(구역별 효율, 인버터별 손실률 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 구역 필터를 `A구역`(3초 지연) → `B구역`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 A구역 결과가 최신 B구역 패널 목록을 덮어써 패널 목록과 우측 발전량 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 관리자 A(김태양)에서 관리자 B(이패널)로 전환 시 패널 목록은 B 권한 기준으로 갱신되나, 상단 이상 패널 수(`cachedHotspotCount`) 및 최근 점검 상세 알림(`cachedRecentJob`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 작업자가 발전량 보정 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `POWER CALIBRATED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 패널 정보 수정(설치일자, 패널 등급, 관리 구역) 동시 수정 시 백엔드는 설치일자와 관리 구역만 저장하고 패널 등급은 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `점검완료 처리 + 즉시 작업자 변경 (Error 1)` 클릭 ➔ 0.1초 후 작업자 변경 완료 ➔ 3초 후 점검 상태 변경 완료 ➔ 새로고침 시 작업자가 롤백됨 확인.
2. **Error 2**: `⚡ 점검 취소 후 발전량 보정 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 점검 취소(CANCELLED) ➔ 4초 후 발전량 보정이 INSPECTING으로 복원됨 확인.
3. **Error 3**: 좌측 `발전량 낮은순` 정렬 선택 ➔ 최상단 패널 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 패널 데이터 표시됨 확인.
4. **Error 4**: 발전 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 로그 목록에서 소거 ➔ 구역별 효율 수치 변경되지 않음 확인.
5. **Error 5**: 구역 필터를 `A구역` → 즉시 `B구역`으로 변경 ➔ 3초 후 A구역 결과가 B구역 목록을 덮어씀 확인.
6. **Error 6**: 상단 작업자를 `김태양(A)` → `이패널(B)`으로 전환 ➔ 패널 목록은 갱신되나 상단 핫스팟 수치는 A 캐시(7개) 잔존 확인.
7. **Error 7**: 점검 작업 탭 > `🔒 권한 없는 직원의 발전량 강제 보정 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 POWER CALIBRATED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 패널 정보 수정 > 설치일자, 패널 등급, 관리 구역 수정 후 `패널 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 패널 등급만 이전 값 유지됨 확인.
