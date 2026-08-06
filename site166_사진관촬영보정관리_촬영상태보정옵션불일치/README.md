# PhotoStudioOps (site166_사진관촬영보정관리_촬영상태보정옵션불일치)

사진관 촬영 예약, 1:1 보정 옵션, 앨범 출고 통합 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5266`

---

## 🏗️ 디렉토리 구조

```
site166_사진관촬영보정관리_촬영상태보정옵션불일치
├─ frontend (React + Vite, Port: 5266)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9665)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9665`
- **Frontend 화면**: `http://localhost:5266`

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

- **촬영 예약 대장**: 60건 촬영 예약(예약 코드, 고객명, 연락처, 촬영 상품명, 상품 카테고리, 촬영 일시, 보정 요청 옵션, 결제금액) 관제.
- **촬영 상품 & 고객**: 25개 스튜디오 촬영 상품 & 50명 등록 고객 및 70건 1:1 보정 작업 관리.
- **출고 로그 & 감사 이력**: 60건의 앨범/액자 택배 출고 실시간 로그 & 90건의 스튜디오 관제 통합 감사 이력 관제.
- **촬영 진행 상태**: 예약완료(RESERVED), 촬영중(SHOOTING), 촬영완료(SHOT_COMPLETED), 보정작업중(RETOUCHING), 출고완료(DELIVERED), 예약취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 촬영 상태를 촬영완료(SHOT_COMPLETED - 3초 지연 완료)로 변경 직후 보정 옵션을 수정(0.1초 완료)하면, 옵션 수정 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 보정 옵션)을 덮어써 저장됩니다. 새로고침 시 촬영 상태와 상세 패널의 보정 옵션이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 예약 취소 API(0.5초 완료) 직후 앨범 출고 API(4초 지연 완료) 호출 시, 예약 취소는 성공하지만 늦게 완료된 앨범 출고 요청이 취소된 예약을 다시 `DELIVERED`(출고완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 예약 목록을 촬영 일시 빠른 순 또는 상품 금액 높은 순으로 정렬 후 상세 버튼 클릭 시 `sortedReservations` 배열 대신 원본 `reservations[]` 배열의 같은 인덱스 예약이 선택됩니다.

4. **통계 집계 불일치**
   - 출고 로그 삭제(`DELETE /api/dispatch-logs/:id`) 시 출고 로그 목록에서 소거되나 `studioStats`(작업자별 처리량, 상품별 선택률, 월별 출고율 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 상품 필터를 `프로필/증명사진 패키지`(3초 지연) → `웨딩/웨딩스냅 패키지`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 프로필 결과가 최신 웨딩 목록을 덮어써 예약 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 실장 A(김스튜디오)에서 실장 B(이보정)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 보정대기 수(`cachedPendingRetouchCount`) 및 최근 예약 알림(`cachedRecentCustomer`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 앨범 출고 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `PHOTO STUDIO ALBUM DISPATCH COMPLETED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 고객 정보 수정(고객명, 선호촬영컨셉, 연락처) 동시 수정 시 백엔드는 고객명과 선호촬영컨셉만 저장하고 연락처는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `촬영완료 변경 + 즉시 보정 옵션 수정 (Error 1)` 클릭 ➔ 0.1초 후 보정 옵션 수정 완료 ➔ 3초 후 촬영완료 변경 완료 ➔ 새로고침 시 보정 옵션이 롤백됨 확인.
2. **Error 2**: `⚡ 예약 취소 후 앨범 출고 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 예약 취소(CANCELLED) ➔ 4초 후 앨범 출고가 DELIVERED로 복원됨 확인.
3. **Error 3**: 좌측 `촬영 일시 빠른 순` 정렬 선택 ➔ 최상단 예약 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 예약 데이터 표시됨 확인.
4. **Error 4**: 출고 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 출고 로그 목록에서 소거 ➔ 작업자별 처리량 수치 변경되지 않음 확인.
5. **Error 5**: 상품 필터를 `프로필/증명사진 패키지` → 즉시 `웨딩/웨딩스냅 패키지`로 변경 ➔ 3초 후 프로필 결과가 웨딩 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김스튜디오(A)` → `이보정(B)`으로 전환 ➔ 목록은 갱신되나 상단 보정대기 수치는 A 캐시(9건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 앨범 출고 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 PHOTO STUDIO ALBUM DISPATCH COMPLETED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 고객 정보 수정 > 고객명, 선호촬영컨셉, 연락처 수정 후 `고객 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 연락처만 이전 값 유지됨 확인.
