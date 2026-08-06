# MemorialDesk (site135_장례식장빈소조문관리_빈소상태예약정보불일치)

장례식장 빈소 예약, 조문객 키오스크 안내, 장례 의전 일정 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5235`

---

## 🏗️ 디렉토리 구조

```
site135_장례식장빈소조문관리_빈소상태예약정보불일치
├─ frontend (React + Vite, Port: 5235)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9634)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9634`
- **Frontend 화면**: `http://localhost:5235`

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

- **장례식장 빈소 대장**: 25개소 빈소(빈소 호수, 평형 규격, 고인 성함, 상주 성명, 입실 일시, 발인 일시) 관제.
- **빈소 임대 예약 & 의전 일정**: 40건의 빈소 임대 예약 & 35건의 입관/성복제/발인 예배 타임 스케줄 관리.
- **조문객 안내 로그**: 60건의 1층 키오스크 조문객 접수 안내 로그 & 80건의 장례식장 통합 감사 이력 관제.
- **빈소 이용 상태**: 빈소대기(VACANT), 사용중(IN_USE), 안내중(GUIDING), 정리중(CLEANING), 예약취소(CANCELLED), 강제종료(TERMINATED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 빈소 상태를 사용중(IN_USE - 3초 지연 완료)으로 변경 직후 장례 일정을 변경(0.1초 완료)하면, 일정 변경 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 장례 일정)을 덮어써 저장됩니다. 새로고침 시 빈소 상태와 상세 패널의 장례 일정이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 예약 취소 API(0.5초 완료) 직후 조문객 안내 등록 API(4초 지연 완료) 호출 시, 예약 취소는 성공하지만 늦게 완료된 조문객 안내 등록 요청이 취소된 예약을 다시 `GUIDING`(안내중) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 빈소 목록을 입실일시 임박순 또는 평형 대형순으로 정렬 후 상세 버튼 클릭 시 `sortedAltars` 배열 대신 원본 `altars[]` 배열의 같은 인덱스 빈소가 선택됩니다.

4. **통계 집계 불일치**
   - 조문객 안내 로그 삭제(`DELETE /api/visitor-guides/:id`) 시 안내 로그 목록에서 소거되나 `memorialStats`(빈소별 방문자 수, 직원별 처리량 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 빈소 상태 필터를 `VACANT`(3초 지연) → `IN_USE`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 VACANT 결과가 최신 IN_USE 빈소 목록을 덮어써 빈소 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 장례지도사 A(김장례)에서 장례지도사 B(이의전)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 사용중 빈소 수(`cachedInUseCount`) 및 최근 빈소 알림(`cachedRecentAltar`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 빈소 강제종료 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `ALTAR FORCE TERMINATED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 예약자 정보 수정(이름, 연락처, 요청사항) 동시 수정 시 백엔드는 이름과 요청사항만 저장하고 연락처는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `사용중 변경 + 즉시 일정 변경 (Error 1)` 클릭 ➔ 0.1초 후 장례 일정 변경 완료 ➔ 3초 후 사용중 변경 완료 ➔ 새로고침 시 장례 일정이 롤백됨 확인.
2. **Error 2**: `⚡ 예약 취소 후 조문객 안내 등록 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 예약 취소(CANCELLED) ➔ 4초 후 조문객 안내 등록이 GUIDING으로 복원됨 확인.
3. **Error 3**: 좌측 `입실일시 임박순` 정렬 선택 ➔ 최상단 빈소 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 빈소 데이터 표시됨 확인.
4. **Error 4**: 조문 안내 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 조문 안내 로그 목록에서 소거 ➔ 빈소별 방문자 수 수치 변경되지 않음 확인.
5. **Error 5**: 빈소 상태 필터를 `VACANT` → 즉시 `IN_USE`로 변경 ➔ 3초 후 VACANT 결과가 IN_USE 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김장례(A)` → `이의전(B)`으로 전환 ➔ 목록은 갱신되나 상단 사용중 빈소 수치는 A 캐시(12개소) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 빈소 강제종료 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 ALTAR FORCE TERMINATED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 상주 정보 수정 > 이름, 연락처, 요청사항 수정 후 `상주 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 연락처만 이전 값 유지됨 확인.
