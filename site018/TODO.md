# TODO - site018

## 생성 진행
- [x] 프로젝트 폴더 생성
- [x] package.json 작성
- [x] Express 서버 작성
- [x] API 엔드포인트 작성
- [x] Mock 결제 이벤트 데이터 작성
- [x] Mock 구독 데이터 작성
- [x] Mock 청구서 데이터 작성
- [x] Mock 웹훅 처리 데이터 작성
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
- [x] npm run build 확인
- [x] npm start 확인
- [x] 브라우저 접속 확인
- [x] /api/health 확인
- [x] 정상 API 응답 확인
- [x] 의도된 백엔드 오류 4개 응답 확인
- [x] 프론트엔드에서 오류 상태 표시 확인
- [x] 의도되지 않은 서버 오류 없음 확인

## 배포 진행
- [x] 배포 설정 작성
- [x] 배포 실행
- [x] 배포 URL 확인
- [x] 배포 후 정상 API 확인
- [x] 배포 후 의도된 백엔드 오류 4개 재확인

## 의도된 오류 목록
- [x] site018-bug01 - 비동기 웹훅 처리 순서가 역전되어 subscription.activated가 payment.created보다 먼저 처리됨
- [x] site018-bug02 - 다형성 JSON payload에서 타입 식별자가 누락되어 잘못된 결제 타입으로 처리됨
- [x] site018-bug03 - 위험도 정렬 요청 시 불투명한 정렬 공식으로 기대와 다른 순서가 반환됨
- [x] site018-bug04 - mock crash 복구 후 payment, invoice, subscription 상태가 불일치함
