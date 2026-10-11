# RoamDrive (B-09) — 차량 예약 사이트

- 사이트 ID: **B-09** / 이름: **RoamDrive** (렌터카 검색·옵션·예약 관리)
- 용도: **Unseen Test** (Training 사이트와 DOM·버튼명·API·화면 구조를 달리한 평가용 환경)
- 확인전략: SEQUENCE_REPLAY + ACTION_REPLAY + STATE_REVISIT
- 모든 데이터는 가상이며 실제 렌터카/보험/결제/지도/운전자 인증 API 는 사용하지 않는다. 결제 대신 가상 예약 확정.

## 기술 스택
- Frontend: React 18 + Vite + React Router — 포트 **5324**
- Backend: Node.js + Express — 포트 **9723**
- DB: SQLite (`better-sqlite3`, `backend/data/roamdrive.db`, 최초 기동 시 자동 생성·시드)

## 폴더 구조
```
siteB09_차량예약/
├─ frontend/ (src: components, screens, flows, hooks, api, styles)
├─ backend/  (server.js, routes, controllers, services, db/{init,seed}.js, data/)
├─ README.md  BUGS.md  TODO.md
```

## 실행 (각각 다른 터미널)
```
cd backend  && npm install && npm run dev      # http://localhost:9723
cd frontend && npm install && npm run dev      # http://localhost:5324
```
브라우저: http://localhost:5324 (기준일 "오늘"은 서버 고정값 2026-10-14)

## 정상 기능
지역/지점 검색(자동완성), 픽업·반납 일시 선택, 차량 조회(차종·인원·연료·정렬), 가용성/예약 일정 조회, 차량 상세·이미지 갤러리·사양, 차량 비교(최대 3대), 대여료 계산(시즌·장기할인·편도 수수료), 보험 선택/해제, 부가 옵션 수량 선택, 운전자 정보 입력, 예약 확정 및 바우처, 내 예약 타임라인, 예약 정보 수정, 반납 일정 변경, 예약 취소, 픽업/반납/대여 종료 처리, 내역 정리(삭제), 차량 현황·대여 내역·활동 로그, Reset.
상태 전이: 예약대기 → 예약확정 → 픽업완료 → 반납완료 → 대여종료 / (대기·확정 → 예약취소). 유효하지 않은 전이는 409 로 거부.

## API
```
GET  /api/health
GET  /api/fleet (pickupDepot,returnDepot,start,end,category,seats,fuel,sort,onlyAvailable)
GET  /api/fleet/:vehicleId          GET /api/fleet/:vehicleId/availability
GET  /api/depots (q,city)           GET /api/rates     POST /api/quotes/calculate
GET  /api/addons                    GET /api/protection-plans
GET  /api/drivers                   GET /api/drivers/:id
GET/POST /api/itineraries           GET/PATCH /api/itineraries/:id
POST /api/itineraries/:id/cancel | pickup | return
DELETE /api/itineraries/:id/history
GET  /api/fleet-status              GET /api/operations/history
GET  /api/media/models/:modelId/:n.svg   (차량 이미지)
POST /api/test/reset
```
응답: `{ data, meta? }`, 오류: `{ error: { code, message } }` (400/404/409).
가용성·중복 예약 차단, 지점/옵션 검증, 금액은 선택한 보험·옵션만 서버가 계산한다.

## 초기 데이터 (고정 seed)
차량 160 / 모델 45 / 지점 30 / 고객 120 / 예약 200 / 보험·옵션 20 / 옵션 선택 기록 190 / 픽업 기록 120 / 반납 기록 100 / 정비 기록 120 / 가격 정책 80 / 활동 로그 150. 고정 예약 ID 1~12 (BUGS.md 참고).

## 의도적 오류 5개 (상세: BUGS.md)
| ID | 전략 | 요약 | 재현 요약 |
|---|---|---|---|
| B09-ERR01 | SEQUENCE_REPLAY | 미선택 보험 자동 추가 | 서울역점 검색 → 차량 선택 → "추가 보험 없음" → 끝까지 진행 → 확인 화면에 추가 보험·금액 증가 |
| B09-ERR02 | SEQUENCE_REPLAY | 수정 후 타임라인 오표시 | 예약 1 상세 → 예약 정보 수정 → 복귀 → 반납 단계 완료로 표시 |
| B09-ERR03 | ACTION_REPLAY | 변경 완료 메시지 누락 | 예약 2 반납 시간 변경 저장 → 토스트 없음 |
| B09-ERR04 | STATE_REVISIT | 취소 예약 뒤로가기 후 재표시 | 예약 3 취소 → 이동 → 뒤로가기(목록) → 예약확정으로 표시 |
| B09-ERR05 | ACTION_REPLAY | 내역 정리 확인 생략 | 내역 관리 > 취소 내역 > 내역 정리 즉시 삭제 |

## Reset
- `POST http://localhost:9723/api/test/reset` — 차량·위치·예약·픽업/반납·옵션·가격 정책·활동 로그를 고정 seed 로 재생성.
- 프론트(예약 단계, 검색 조건, 목록 캐시)는 푸터 "테스트 데이터 초기화" 또는 콘솔 `await window.__roamReset()` 로 함께 초기화.

## 문서
BUGS.md(오류 명세), TODO.md(진행·미검증 항목). 정적 점검만 수행했으며 npm install / 서버 실행 / 브라우저 재현은 하지 않았다.
