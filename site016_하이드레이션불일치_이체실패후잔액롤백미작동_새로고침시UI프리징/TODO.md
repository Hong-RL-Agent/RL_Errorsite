# TODO - site016

## 생성 진행
- [x] 프로젝트 폴더 생성
- [x] package.json 작성
- [x] Express 서버 작성
- [x] API 엔드포인트 작성
- [x] 프론트엔드 UI 작성
- [x] 스타일 작성
- [x] 의도된 GUI 오류 3개 삽입 (하이드레이션 불일치, 낙관적 업데이트 실패, 파싱 동결)
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
- [x] site016-bug01 - 하이드레이션 불일치: 초기 로드 시 환율 요약 카드 텍스트 겹침
- [x] site016-bug02 - 낙관적 업데이트 상태 불일치: 이체 실패 시 잔액 롤백 미흡
- [x] site016-bug03 - 엄격한 파싱에 의한 화면 마비: 새로고침 클릭 시 JS 에러로 인한 UI 프리징
