# TODO - site022

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
  - [x] Bug 01 (rtl-layout-not-supported): RTL 모드 레이아웃 미반영 확인
  - [x] Bug 02 (prefers-reduced-motion-ignored): 동작 줄이기 무시 애니메이션 확인
  - [x] Bug 03 (dark-mode-override): 시스템 다크 모드 무시(라이트 테마 강제) 확인
- [x] 의도되지 않은 서버 오류 없음 확인

## 배포 진행
- [x] 배포 설정 작성
- [x] 배포 실행
- [x] 배포 URL 확인
- [x] 배포 후 오류 3개 재확인
