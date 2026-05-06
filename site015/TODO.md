# TODO - site015

## 생성 진행
- [x] 프로젝트 폴더 생성
- [x] package.json 작성
- [x] Express 서버 작성
- [x] API 엔드포인트 작성
- [x] 프론트엔드 UI 작성
- [x] 스타일 작성
- [x] 의도된 GUI 오류 3개 삽입 (XSS, Open Redirect, Clickjacking)
- [x] 오류 위치 data-bug-id 삽입
- [x] 오류 코드 바로 위 INTENTIONAL GUI BUG 주석 삽입
- [x] README.md 작성
- [x] BUGS.md 작성

## 검증 진행
- [x] npm install 확인
- [x] npm run build 확인
- [x] npm start 확인
- [x] 브라우저 접속 확인
- [x] /api/health 확인
- [x] 의도된 오류 3개 화면 확인
- [x] 의도되지 않은 서버 오류 없음 확인

## 배포 진행
- [ ] 배포 설정 작성
- [ ] 배포 실행
- [ ] 배포 URL 확인
- [ ] 배포 후 오류 3개 재확인

## 의도된 오류 목록
- [x] site015-bug01 - XSS: 게시글 상세 보기 시 악성 스크립트 실행으로 인한 경고창 시뮬레이션
- [x] site015-bug02 - Open Redirect: 파트너 로그인 버튼 클릭 시 피싱 경고 페이지로 이동
- [x] site015-bug03 - Clickjacking: 임시 저장 버튼 위에 투명 레이어를 두어 클릭 시 비정상 액션 유도
