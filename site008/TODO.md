# TODO

## Project Setup
- [x] 프로젝트 폴더 생성 (`site008`)
- [x] `package.json` 생성 및 Express 의존성 추가
- [x] `README.md` 작성
- [x] `BUGS.md` 작성

## Backend (server.js)
- [x] Express 서버 기본 설정 (포트 9337)
- [x] `/api/health` 엔드포인트 구현
- [x] 목업 데이터 설정 (영화, 리뷰, 찜 등)
- [x] `/api/movies` 영화 및 평점 반환 로직 작성
- [x] `/api/reviews` 리뷰 작성/조회 기능 구현
- [x] `/api/favorites`, `/api/preferences` 개인화 데이터 조작 API
- [x] **[BUG]** `site008-bug01` DB 집계 오류 (평균 평점 계산 시 고정값 나누기)
- [x] **[BUG]** `site008-bug02` Content-Type 오염 (리뷰 JSON 응답 시 text/plain)
- [x] **[BUG]** `site008-bug03` 저장형 XSS 취약점 (리뷰 내용 필터링 부재)

## Frontend (public/)
- [x] `index.html` 주요 레이아웃(홈, 넷플릭스 스타일 그리드, 캐러셀) 구성
- [x] `css/style.css` 다크 모드 & 시네마틱 레드 디자인 적용
- [x] `js/app.js` 영화 조회, 장르 필터, 리뷰 XSS 테스트 등 비동기 로직
- [x] 10개 정상 인터랙션 (모달 팝업, 찜하기 하트 토글, 태그 선택 등) 구현
- [x] 취약점 유발 요소에 `data-bug-id` 어트리뷰트 맵핑 완료

## Testing & Verification
- [ ] `npm install` 패키지 설치
- [ ] `npm start` 포트 9337 서버 구동 확인
- [ ] 10개 정상 인터랙션 렌더링 수동 테스트
- [ ] 3개 버그 (평점 0.5 출력 확인, Content-Type 경고창, XSS 스크립트 실행) 수동 검증
