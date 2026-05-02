# TODO

## Project Setup
- [x] 프로젝트 폴더 생성 (`site007`)
- [x] `package.json` 생성 및 Express 의존성 추가
- [x] `README.md` 작성
- [x] `BUGS.md` 작성

## Backend (server.js)
- [x] Express 서버 기본 설정 (포트 9336)
- [x] `/api/health` 엔드포인트 구현
- [x] 목업 데이터 준비 (rooms, bookings, notices)
- [x] `/api/rooms` 스터디룸 조회 로직
- [x] `/api/timeslots` 날짜별 예약 가능 시간표 계산 로직
- [x] `/api/bookings` 내 예약 조회 및 취소 API
- [x] **[BUG]** `site007-bug01` DB 예약 동시성 오류 (중복 예약 검증 생략)
- [x] **[BUG]** `site007-bug02` 네트워크 CORS 오류 (공지사항 API에 잘못된 도메인 강제)
- [x] **[BUG]** `site007-bug03` 보안 관리자 인가 누락 (전체 예약 내역 접근 허용)

## Frontend (public/)
- [x] `index.html` 주요 6개 섹션 레이아웃 구성
- [x] `css/style.css` 프리미엄 스터디카페 테마(Navy Blue/White) 디자인 적용
- [x] `js/app.js` 클라이언트 통신(방 선택, 시간표 렌더링, 공지 등) 작성
- [x] 10개 정상 작동 인터랙션 구현 (필터, 예약, 취소, 탭 전환 등)
- [x] 테스트를 위한 관리자 우회 호출 버튼 및 CORS 에러 메시지 UI 구현
- [x] 취약점 유발 요소에 `data-bug-id` 어트리뷰트 표기 완료

## Testing & Verification
- [ ] `npm install` 패키지 설치
- [ ] `npm start` 포트 9336 서버 구동 확인
- [ ] 10개 정상 인터랙션 브라우저 수동 테스트
- [ ] 3개 버그(중복 시간 예약, CORS 에러 브라우저 차단, 관리자 전체 예약 보기) 수동 재현 확인
