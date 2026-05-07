# TODO - site024

## 생성 진행
- [x] 프로젝트 폴더 생성
- [x] package.json 작성
- [x] Express 서버 작성
- [x] API 엔드포인트 작성
- [x] Mock 상품 데이터 작성
- [x] Mock 카테고리 데이터 작성
- [x] Mock 주문 데이터 작성
- [x] Mock 시드 진단 데이터 작성
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
- [x] 브라우저 접속 확인 (http://localhost:9133)
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
- [x] site024-bug01 - 시드 데이터에서 일부 상품이 존재하지 않는 참조를 가져 데이터 불일치가 발생함
- [x] site024-bug02 - 레거시 상품 응답에서 하위 호환 필드가 삭제되어 호환성이 깨짐
- [x] site024-bug03 - 새 상품 생성 시 기본값 변경으로 status/visibility가 예상과 다르게 저장됨
- [x] site024-bug04 - 주문 상세 포함 조회에서 mock N+1 패턴으로 응답 지연 및 timeout이 발생함
