# TODO - site019

## 생성 진행
- [x] 프로젝트 폴더 생성
- [x] package.json 작성
- [x] Express 서버 작성
- [x] API 엔드포인트 작성
- [x] React 프론트엔드 작성
- [x] 스타일 작성
- [x] 의도된 GUI 오류 3개 삽입
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
- [x] **[가장 중요] 의도된 오류 3개가 화면에서 실제로 관찰/재현되는지 확인**
  - [x] Bug 01 (fixed-text-size-overflow): 강의 카드 텍스트 크기 조절/줌인 시 잘림 확인
  - [x] Bug 02 (non-semantic-clickable-element): '수강 신청' 요소가 div로 작성되어 키보드 접근성 누락 확인
  - [x] Bug 03 (broken-focus-order): 강의 모달 오픈 시 포커스가 배경으로 빠져나가는지 확인
- [x] 의도되지 않은 서버 오류 없음 확인

## 배포 진행
- [x] 배포 설정 작성
- [x] 배포 실행
- [x] 배포 URL 확인
- [x] 배포 후 오류 3개 재확인
