# TODO - site004

## 생성 진행
- [x] 프로젝트 폴더 생성
- [x] package.json 작성
- [x] Express 서버 작성
- [x] API 엔드포인트 작성
- [x] Mock 시험 데이터 작성
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
- [x] npm run build (또는 정적/CDN 서빙 방식 적용) 확인
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
- [x] site004-bug01 - stress=true 제출 요청 시 안전한 mock resource-exhaustion 응답 발생
- [x] site004-bug02 - prompt injection 문구가 포함된 답안 제출 시 비정상 채점 결과 반환
- [x] site004-bug03 - 시험 시작 없이 제출 API 직접 호출 시 제출 성공 처리
- [x] site004-bug04 - 제출 완료 후에도 문제 조회 API 호출 시 문제 목록 반환
