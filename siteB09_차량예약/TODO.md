# TODO.md — B-09 RoamDrive

- [x] 프로젝트 기본 구조 (frontend / backend 분리, 포트 5324 / 9723)
- [x] React UI (검색 패널, 차량 카드, 상세/갤러리, 비교, 단계별 예약, 바우처, 예약 타임라인, 내역 관리, 이용 기록)
- [x] Express API (명세 엔드포인트 + 이미지 보조 엔드포인트)
- [x] SQLite 초기 데이터 (고정 seed, 최소 수량 충족 — 생성 로직을 node 로 실행해 개수 확인)
- [x] 상태 전이 검증 로직 (픽업 전 반납 차단, 중복 예약 차단)
- [x] 오류 5개 구현 (SEQUENCE_REPLAY 2 / ACTION_REPLAY 2 / STATE_REVISIT 1)
- [x] Reset API 및 프론트 초기화 (`window.__roamReset`)
- [x] README / BUGS.md
- [x] 정적 점검 (backend `node --check` 통과, 견적 계산 함수 실행 확인, 산출물 없음)
- [ ] npm install
- [ ] 프론트엔드 JSX 빌드/구문 검증 (npm 미설치로 미수행)
- [ ] 서버 실행 및 API/SQLite 동작 테스트
- [ ] 브라우저에서 정상 예약 흐름 확인
- [ ] 오류 5개 브라우저 재현 확인 (ERR04 뒤로가기 포함)
