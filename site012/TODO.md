# TODO - site012

## 생성 진행
- [x] 프로젝트 폴더 생성
- [x] package.json 작성
- [x] Express 서버 작성
- [x] API 엔드포인트 작성
- [x] Mock 데이터 작성
- [x] 프론트엔드 UI 작성
- [x] 스타일 작성
- [x] 프론트엔드 API fetch 연동
- [x] API 로딩 상태 UI 작성
- [x] API 에러 상태 UI 작성
- [x] 의도된 백엔드 오류 4개 삽입
- [x] 오류 관련 UI에 data-bug-id 삽입
- [x] 오류 코드 바로 위 INTENTIONAL BACKEND BUG 주석 삽입
- [x] README.md 작성
- [x] BUGS.md 작성

## 검증 진행
- [x] npm install 확인
- [x] npm run build 확인 (public/index.html로 대체 확인)
- [x] npm start 확인
- [x] 브라우저 접속 확인
- [x] /api/health 확인
- [x] 정상 API 응답 확인
- [x] 의도된 백엔드 오류 4개 응답 확인
- [x] 프론트엔드에서 오류 상태 표시 확인
- [x] 의도되지 않은 서버 오류 없음 확인

## 배포 진행
- [ ] 배포 설정 작성
- [ ] 배포 실행
- [ ] 배포 URL 확인
- [ ] 배포 후 정상 API 확인
- [ ] 배포 후 의도된 백엔드 오류 4개 재확인

## 의도된 오류 목록
- [x] site012-bug01 - 그림자 계정 잔액 합산 오류
- [x] site012-bug02 - 멱등성 결여로 인한 중복 송금 처리
- [x] site012-bug03 - 오류 발생 시 잔액 롤백 실패
- [x] site012-bug04 - 실패한 요청의 로그 기록 누출
