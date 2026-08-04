# TODO.md — site070 회의실 예약 웹사이트

## 프로젝트 셋업
- [x] package.json 생성 (start/dev/build 스크립트 포함)
- [x] Express 서버 (server.js) 구현
- [x] public/ 디렉터리 구조 생성
- [x] npm install 완료

## 백엔드 API
- [x] GET /api/health 엔드포인트 구현
- [x] GET /api/rooms 엔드포인트 구현 (6개 회의실 mock 데이터)
- [x] GET /api/time-slots 엔드포인트 구현 (10개 슬롯, 중복 없음)
- [x] Express static 파일 서빙 설정

## 프론트엔드 UI
- [x] index.html — 전체 페이지 구조 작성
- [x] styles.css — 디자인 시스템 (Deep Blue / White / Mint) 적용
- [x] app.js — Vanilla JS 렌더링 및 인터랙션 구현

## 주요 섹션 (5개 이상)
- [x] Header (로고, 내비게이션, 로그인 버튼)
- [x] Hero (CTA, 빠른 검색 바, 통계 카드)
- [x] Filter Bar (인원 필터, 장비 필터, 초기화)
- [x] Rooms Section (카드 그리드 2열)
- [x] Booking Section (캘린더 + 시간 슬롯)
- [x] Right Panel (예약 요약, 예약 안내, 인기 시간대)
- [x] Footer (서비스, 시설, 고객센터 링크)

## 정상 기능 (10개 이상 인터랙션)
- [x] 날짜 선택 (hero 날짜 입력 / 캘린더 클릭)
- [x] 인원 필터 (hero 셀렉트 / filter bar 셀렉트)
- [x] 장비 필터 체크박스 (프로젝터, 화상회의, 화이트보드, 사운드시스템)
- [x] 필터 초기화 버튼
- [x] 회의실 카드 상세보기 (모달 열기)
- [x] 모달 닫기 (X 버튼, 배경 클릭, ESC 키)
- [x] 회의실 예약하기 버튼 (booking section으로 이동)
- [x] 캘린더 이전/다음 달 이동
- [x] 캘린더 날짜 선택
- [x] 시간 슬롯 선택
- [x] 예약 요약 패널 접기/펼치기
- [x] 예약 확정 버튼 (alert 확인)
- [x] 선택 초기화 버튼
- [x] 다른 회의실 선택 버튼
- [x] 네비게이션 스크롤 이동
- [x] "준비중" alert (로그인, 팀예약, 장비필터, 푸터 링크 등)

## API 데이터 연동
- [x] fetch /api/rooms → 회의실 카드 렌더링
- [x] fetch /api/time-slots → 시간 슬롯 렌더링
- [x] API 로딩 상태 UI (스피너)
- [x] API 에러 상태 UI (재시도 버튼)

## 의도된 오류 삽입
- [x] bug01: 시간 슬롯 중복 표시 (app.js — renderTimeSlots)
- [x] bug02: 달력 grid overflow (styles.css — .calendar-grid)
- [x] bug03: 예약 버튼 무반응 (app.js — renderRoomCards, room-03)
- [x] INTENTIONAL GUI BUG 주석 각 오류 위에 작성
- [x] data-bug-id 속성 각 요소에 추가

## 문서
- [x] README.md 작성
- [x] BUGS.md 작성
- [x] TODO.md 작성

## 미구현 (준비중 alert 처리)
- [ ] 로그인 / 회원가입 기능
- [ ] 팀 예약 기능
- [ ] 장비 필터 전용 페이지
- [ ] 예약 현황 관리 페이지
- [ ] 결제 연동
- [ ] 알림 기능
- [ ] 이용 규정 / 취소 정책 페이지
- [ ] 고객센터 페이지
