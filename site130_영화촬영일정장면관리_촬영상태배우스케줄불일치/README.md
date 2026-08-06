# FilmBoard (site130_영화촬영일정장면관리_촬영상태배우스케줄불일치)

영화 제작 촬영 일정, 장면 시나리오, 배우 스케줄 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5230`

---

## 🏗️ 디렉토리 구조

```
site130_영화촬영일정장면관리_촬영상태배우스케줄불일치
├─ frontend (React + Vite, Port: 5230)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9629)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9629`
- **Frontend 화면**: `http://localhost:5230`

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

- **영화 장면 콘티 대장**: 60개 촬영 장면(Scene 번호, 장면 명칭, 촬영 예정일, 로케이션, 배우 스케줄, 중요도) 관제.
- **출연 배우 & 세트장**: 25명 캐스팅 배우 현장 콜타임 & 20개 야외 로케이션 세트장 대관 관리.
- **촬영 테이크 & 감사 로그**: 80건의 실시간 촬영 테이크 로그 & 90건의 프로덕션 감사 로그 관제.
- **촬영 상태**: 준비중(PREPARING), 촬영중(FILMING), 촬영완료(COMPLETED), 일시중지(PAUSED), 촬영취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 촬영 상태를 촬영완료(COMPLETED - 3초 지연 완료)로 변경 직후 배우 스케줄을 변경(0.1초 완료)하면, 배우 스케줄 변경 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 배우 스케줄)을 덮어써 저장됩니다. 새로고침 시 장면 촬영상태와 상세 패널의 배우 스케줄이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 촬영 취소 API(0.5초 완료) 직후 촬영 로그 작성 API(4초 지연 완료) 호출 시, 촬영 취소는 성공하지만 늦게 완료된 촬영 로그 작성 요청이 취소된 장면을 다시 `FILMING`(촬영중) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 장면 목록을 촬영 예정일순 또는 중요도순으로 정렬 후 상세 버튼 클릭 시 `sortedScenes` 배열 대신 원본 `scenes[]` 배열의 같은 인덱스 장면이 선택됩니다.

4. **통계 집계 불일치**
   - 촬영 로그 삭제(`DELETE /api/filming-logs/:id`) 시 촬영 로그 목록에서 소거되나 `filmStats`(배우별 촬영 시간, 로케이션 사용률 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 배우 필터를 `최민수`(3초 지연) → `이병헌`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 최민수 결과가 최신 이병헌 장면 목록을 덮어써 장면 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 제작자 A(김감독)에서 제작자 B(이PD)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 미촬영 장면 수(`cachedUnshotCount`) 및 최근 장면 알림(`cachedRecentScene`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 스태프가 촬영 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `FILMING SCENE COMPLETED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 장면 정보 수정(장면명, 로케이션, 촬영예정일) 동시 수정 시 백엔드는 장면명과 촬영예정일만 저장하고 로케이션은 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `촬영완료 변경 + 즉시 배우 스케줄 변경 (Error 1)` 클릭 ➔ 0.1초 후 배우 스케줄 변경 완료 ➔ 3초 후 촬영완료 변경 완료 ➔ 새로고침 시 배우 스케줄이 롤백됨 확인.
2. **Error 2**: `⚡ 촬영 취소 후 촬영 로그 작성 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 촬영 취소(CANCELLED) ➔ 4초 후 촬영 로그 작성이 FILMING으로 복원됨 확인.
3. **Error 3**: 좌측 `촬영 예정일 임박순` 정렬 선택 ➔ 최상단 장면 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 장면 데이터 표시됨 확인.
4. **Error 4**: 촬영 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 촬영 로그 목록에서 소거 ➔ 배우별 촬영 시간 수치 변경되지 않음 확인.
5. **Error 5**: 배우 필터를 `최민수` → 즉시 `이병헌`으로 변경 ➔ 3초 후 최민수 결과가 이병헌 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김감독(A)` → `이PD(B)`으로 전환 ➔ 목록은 갱신되나 상단 미촬영 장면 수치는 A 캐시(36건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 스태프의 촬영 완료 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 FILMING SCENE COMPLETED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 장면 정보 수정 > 장면명, 로케이션, 촬영예정일 수정 후 `장면 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 로케이션만 이전 값 유지됨 확인.
