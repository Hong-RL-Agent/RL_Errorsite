# TODO.md — 개발 및 검증 현황

실제로 확인한 항목만 [x] 로 표시한다. (npm install / build / 서버 실행은 이번 작업 범위에서 제외)

- [x] 프로젝트 구조 (frontend / backend / README / BUGS / TODO 생성)
- [x] React UI 코드 작성 (헤더, 검색, 진료과 카드, 병원 목록/상세, 의사 카드, 캘린더, 슬롯, 모달 4종, 내 예약, 알림, 로그, 도움말)
- [x] Express API 코드 작성 (명세 엔드포인트 전체 + `/api/regions`)
- [x] SQLite 스키마 및 고정 seed 코드 작성
- [x] 예약 신청·확정·변경·수정·취소 로직 코드 작성 (중복/상태/슬롯 검증 포함)
- [x] 의도적 오류 5개 코드 작성 (`INTENTIONAL_ERROR` 주석 5개, `data-bug-id` 적용)
- [x] Reset 기능 코드 작성 (`POST /api/test/reset`, Frontend 캐시 초기화)
- [x] README.md 작성
- [x] BUGS.md 작성
- [x] 정적 점검: Backend 전체 `node --check` 구문 통과, package.json JSON 유효성, 포트/스크립트 값, INTENTIONAL_ERROR 5건 확인, Frontend 괄호 균형 점검
- [ ] `npm install` (Backend / Frontend)
- [ ] 실제 서버 실행 확인 (Backend 9717 / Frontend 5318)
- [ ] seed 건수 실측 (병원 30, 의사 104, 예약 220 등)
- [ ] 오류 5개 브라우저 재현 확인
- [ ] Reset 반복 시 동일 ID/데이터 복원 확인
