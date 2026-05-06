# TODO - site012

## 생성 진행
- [x] 프로젝트 폴더 생성
- [x] package.json 작성
- [x] Express 서버 작성
- [x] API 엔드포인트 작성
- [x] 프론트엔드 UI 작성
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
- [x] 의도된 오류 3개 화면 확인
- [x] 의도되지 않은 서버 오류 없음 확인

## 배포 진행
- [ ] 배포 설정 작성
- [ ] 배포 실행
- [ ] 배포 URL 확인
- [ ] 배포 후 오류 3개 재확인

## 의도된 오류 목록
- [x] site012-bug01 - button-no-response: "거래 추가" 버튼 onClick 누락, 아무 반응 없음
- [x] site012-bug02 - state-mismatch: 총 지출 요약 카드 값이 실제 합계보다 99,999원 더 많게 표시됨
- [x] site012-bug03 - css-layout: 테이블 래퍼에 overflow-x:hidden + 음수 margin으로 작은 화면에서 첫 열 잘림
