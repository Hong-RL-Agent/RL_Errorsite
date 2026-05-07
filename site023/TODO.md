# TODO - site023

## 생성 진행
- [x] 프로젝트 폴더 생성
- [x] package.json 작성
- [x] Express 서버 작성
- [x] API 작성
- [x] Mock 토너먼트 데이터 작성
- [x] Mock 팀 데이터 작성
- [x] Mock 경기 데이터 작성
- [x] 프론트엔드 UI 작성
- [x] 스타일 작성
- [x] API 연동
- [x] 로딩 UI
- [x] 에러 UI
- [x] 의도된 백엔드 오류 4개 삽입
- [x] data-bug-id 삽입
- [x] BUGS.md 작성
- [x] README.md 작성

## 검증 진행
- [ ] npm install 확인
- [ ] npm run build 확인
- [ ] npm start 확인
- [ ] 브라우저 접속 확인 (http://localhost:9132)
- [ ] /api/health 확인
- [ ] 정상 API 확인
- [ ] 버그 4개 확인

## 의도된 오류 목록
- [x] site023-bug01 - 스키마 격리 실패 (다른 리그 데이터 노출)
- [x] site023-bug02 - 테넌트 필터 없는 쿼리 (전체 팀 목록 반환)
- [x] site023-bug03 - 조인 데이터 유출 (무관한 경기 정보 포함)
- [x] site023-bug04 - 인덱스 혼합 (라운드 순서 뒤섞임)
