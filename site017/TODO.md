# TODO - site017

## 생성 진행
- [x] 프로젝트 폴더 생성
- [x] package.json 작성
- [x] Express 서버 작성
- [x] API 엔드포인트 작성
- [x] Mock 에이전트 데이터 작성
- [x] Mock 액션 스페이스 데이터 작성
- [x] Mock 모델 버전 데이터 작성
- [x] Mock 백그라운드 업데이트 데이터 작성
- [x] Mock 설정 오버라이드 데이터 작성
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
- [x] site017-bug01 - 백그라운드 업데이트 완료 후에도 agent record lock이 해제되지 않음
- [x] site017-bug02 - UI 액션 스페이스와 서버 검증 액션 스페이스가 불일치함
- [x] site017-bug03 - base model과 adapter version이 불일치해도 compatible true가 반환됨
- [x] site017-bug04 - 글로벌 업데이트 후에도 오래된 local override 설정이 우선 적용됨
