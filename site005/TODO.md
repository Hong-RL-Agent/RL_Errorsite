# TODO - site005

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
- [x] site005-bug01 - undefined-state-transition (존재하지 않는 시청 상태 허용)
- [x] site005-bug02 - implicit-state-assumption (구독 없이 시청 허용)
- [x] site005-bug03 - feature-interaction-conflict (다운로드/삭제 동시 호출 시 상태 충돌)
- [x] site005-bug04 - business-logic-paradox (구독 해지 후에도 기존 콘텐츠 시청 가능)
