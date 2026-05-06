# TODO 리스트: site017 프로젝트

## 생성 및 설정
- [x] 프로젝트 폴더 구조 생성 (`site017/`)
- [x] `package.json` 및 `vite.config.js` 설정
- [x] Express 백엔드 서버 구축 (`server.js`)
- [x] React 프론트엔드 기본 구조 및 CSS 디자인

## 기능 구현
- [x] /api/doctors, /api/appointments 모킹 데이터 API
- [x] 의사 목록 페이징 기능
- [x] 상세 페이지 이동 및 뒤로 가기
- [x] 예약 내역 탭 구현

## 오류 주입 (INTENTIONAL GUI BUG)
- [x] Bug 01: 탭 간 데이터 충돌 (localStorage 동기화 오류)
- [x] Bug 02: 백포워드 캐시 상태 박제 (세션 스토리지 오염)
- [x] Bug 03: 페이징 드리프트 및 리스트 중복 (더보기 병합 로직 오류)

## 검증 및 배포 준비
- [x] 의도된 오류가 화면에서 실제로 재현되는지 확인
- [x] `npm run build`를 통한 정적 파일 생성 및 서버 서빙 확인
- [x] `npm start` 시 9236 포트 정상 작동 확인
- [x] README.md, BUGS.md, TODO.md 작성 완료
