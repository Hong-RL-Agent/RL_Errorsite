# MediSlot (B-03) — 병원 예약 플랫폼

| 항목 | 내용 |
|---|---|
| 사이트 ID | B-03 |
| 사이트 이름 | MediSlot |
| 종류 | 병원 진료 검색·예약·변경·취소 서비스 |
| 학습 구분 | **Training** |
| 확인전략 | **ACTION_REPLAY** |

## 목적
강화학습 모델(RAWD PPO+DQN)이 Frontend GUI 오류를 발견하고 실제 사용자 행동(클릭·스크롤·입력)으로 재현하도록 돕는 학습용 웹서비스. 모든 병원·의사·환자 데이터는 가상이며 외부 의료/결제 API를 사용하지 않는다. 의도적 오류 5개는 Frontend에만 있고 Backend/DB는 정상이다.

## 기술 스택
- Frontend: React 18 + Vite 5 (hooks: useState/useEffect/useMemo/useRef, context)
- Backend: Node.js + Express 4
- DB: SQLite (better-sqlite3), 파일 `backend/data/medislot.db` (자동 생성)

## 프로젝트 구조
```text
siteB03_병원예약/
├─ frontend/  (React + Vite)  src/{components,pages,hooks,api,styles}
├─ backend/   (Express)       server.js, routes/, controllers/, services/, db/{init,seed}.js, data/
├─ README.md  BUGS.md  TODO.md
```

## 설치 및 실행 (각각 다른 터미널)
```bash
# Backend  → http://localhost:9717
cd backend
npm install
npm run dev

# Frontend → http://localhost:5318
cd frontend
npm install
npm run dev     # vite --host 0.0.0.0 --port 5318 --strictPort
```
- 브라우저: `http://localhost:5318`
- Backend API: `http://localhost:9717` (Backend 최초 기동 시 seed 자동 생성)

## 초기 데이터 (고정 seed)
병원 30 · 진료과 12 · 의사 104 · 환자 100 · 예약 220 · 진료 슬롯 수천 건(기준일 -7일 ~ +13일) · 예약 변경 기록 130 · 취소 기록 82 · 알림 120 · 활동 로그 400+.
서비스 기준일(오늘로 간주)은 고정값 `2026-11-02` 이며 `GET /api/health` 의 `baseDate` 로 제공된다. 테스트 환자는 `patientId=1` (김하늘).

## API 목록
```text
GET    /api/health
GET    /api/hospitals          (?q= &department= &region=)
GET    /api/hospitals/:id
GET    /api/departments
GET    /api/regions
GET    /api/doctors            (?hospitalId= &departmentId= &q=)
GET    /api/doctors/:id
GET    /api/doctors/:id/schedule
GET    /api/patients
GET    /api/patients/:id
GET    /api/appointments       (?patientId= &status= &doctorId= &hospitalId= &date=)
GET    /api/appointments/:id
POST   /api/appointments       {patientId, doctorId, date, time, visitReason, memo}
PATCH  /api/appointments/:id   {memo?, visitReason?, date?, time?}
POST   /api/appointments/:id/cancel   {reason}
POST   /api/appointments/:id/confirm
GET    /api/availability       (?doctorId= &date=  또는 ?hospitalId= &date=)
GET    /api/notifications      (?patientId=)
PATCH  /api/notifications/:id/read
GET    /api/activity           (?patientId= &appointmentId= &limit=)
POST   /api/test/reset
```
응답은 `{ "data": ... }`, 오류는 `{ "error": { "code", "message" } }` + 적절한 HTTP 상태(400/404/409). 동일 의사·동일 시간 중복 예약은 409(`SLOT_TAKEN`), 진료 불가 시간은 400, 취소/수정 불가 상태는 409.

## 정상 기능
병원 검색 · 진료과 필터 · 지역 필터 · 정렬 · 병원 상세 · 의사 프로필 · 진료 일정 캘린더 · 날짜 선택 · 예약 가능 시간 조회 · 예약 신청/확정(확인 모달) · 내 예약 목록(상태 탭·검색) · 예약 상세/진료 상태 타임라인 · 예약 날짜·시간 변경 · 예약 정보(방문 사유·메모) 수정 · 예약 취소 · 병원 운영시간 패널 · 알림 확인(개별/전체 읽음) · 활동 로그 필터 · 도움말/FAQ · 테스트 데이터 초기화.

예약 상태: 예약확정 / 진료대기 / 진료완료 / 예약취소. 신규 예약 신청은 `진료대기`로 접수되고 확정 시 `예약확정`이 된다(예약 화면은 신청 직후 자동 확정).

## 의도적 오류 5개 (Frontend 전용)
| bug_id | CSV No | 오류 | 대상 |
|---|---|---|---|
| B03-ERR01 | 1646 | 응답 없는 클릭 (Freeze) | 예약 #1 `예약 변경` |
| B03-ERR02 | 1755 | 수정 및 취소 경로 차단 | 예약 #3 `예약 정보 수정` 모달 |
| B03-ERR03 | 1648 | 성공/실패 피드백 부재 | 예약 #4 취소 |
| B03-ERR04 | 1972 | 캐시 상태 불일치 | 예약 #5 취소 → 요약 카드 |
| B03-ERR05 | 2038 | 스크롤 튐 | 병원 #1 의사 #2 `진료 시간 더보기` |

상세 명세·Oracle은 [BUGS.md](BUGS.md) 참조. 코드에는 `INTENTIONAL_ERROR` 주석, DOM에는 `data-bug-id` 가 있으며 일반 화면에는 표시되지 않는다.

## 오류별 테스트 시나리오
1. **ERR01**: `#/appointments/1` → `예약 변경` 클릭 → 약 3.5초 정지, 모달 미출현. (#2 는 정상)
2. **ERR02**: `#/appointments/3` → `예약 정보 수정` → `취소`/✕ 클릭 → 모달 유지. 헤더 메뉴로 이동 가능.
3. **ERR03**: `#/appointments/4` → `예약 취소` → `예약 취소 확정` → 상태 변경, 토스트 없음.
4. **ERR04**: `#/appointments` 예약확정 건수(8) 확인 → `#/appointments/5` 취소 → 건수 8 유지, 새로고침 후 7.
5. **ERR05**: `#/hospital/1` → 두 번째 의사(의사 #2) 카드까지 스크롤 → `진료 시간 더보기` → 최상단 이동.

## DQN Evidence 설명
- **ActionLog**: 클릭/스크롤/입력 시퀀스
- **UI**: 모달·토스트·배지·요약 카드 텍스트
- **DOM**: `data-modal`, `data-action`, `data-status`, `data-bug-id`, `.slot` 개수 등
- **State**: `window.__medislotState` (route, summary, appointments, unreadNotifications), scrollY
- **Network**: Backend 요청/응답 (예: cancel 200 후 목록 재조회 유무)

## Reset API
`POST http://localhost:9717/api/test/reset` — 모든 테이블을 비우고 고정 seed로 복원한다(예약 ID 포함 동일). 화면에서는 헤더/도움말의 `데이터 초기화` 버튼이 이 API를 호출하고 Frontend 캐시를 비운 뒤 홈으로 복귀한다.

## 문서
- [BUGS.md](BUGS.md): 오류 명세 / [TODO.md](TODO.md): 개발·검증 현황
