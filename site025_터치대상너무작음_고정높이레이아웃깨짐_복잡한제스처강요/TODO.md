# TODO - site025 (Desktop Version)

## 생성 진행
- [x] 프로젝트 폴더 생성
- [x] package.json 작성
- [x] Express 서버 작성
- [x] API 엔드포인트 작성
- [x] React 프론트엔드 작성 (데스크톱 전용 레이아웃)
- [x] 스타일 작성 (global, delivery, cart, desktop-layout)
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
  - [x] Bug 01 (too-small-click-target): 데스크톱 수량 버튼 클릭 난이도 확인
  - [x] Bug 02 (fixed-height-cart-overflow): 우측 패널 하단 잘림 현상 확인
  - [x] Bug 03 (gesture-only-action): 쿠폰 삭제 드래그 강요 확인
- [x] 의도되지 않은 서버 오류 없음 확인

## 배포 진행
- [x] 배포 설정 작성
- [x] 배포 실행
- [x] 배포 URL 확인
- [x] 배포 후 오류 3개 재확인
