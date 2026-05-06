# TODO - site008

## 생성 진행
- [x] 프로젝트 폴더 생성
- [x] package.json 작성
- [x] Express 서버 작성 (server.js)
- [x] API 엔드포인트 작성 (/api/health, /api/movies)
- [x] 프론트엔드 UI 작성 (React + Vite, Lucide-react)
- [x] 스타일 작성 (src/styles/main.css)
- [x] 의도된 GUI 오류 3개 삽입
- [x] 오류 위치 data-bug-id 삽입
- [x] 오류 코드 바로 위 INTENTIONAL GUI BUG 주석 삽입
- [x] README.md 작성
- [x] BUGS.md 작성

## 검증 진행
- [x] npm install 확인 (166 packages, exit code 0)
- [x] npm run build 확인 (vite build 성공, dist/ 생성)
- [x] npm start 확인 (Express 서버 포트 9227 실행 확인)
- [x] 브라우저 접속 확인 (http://localhost:9227 — Midnight Cinema UI 정상 렌더링)
- [ ] /api/health 확인 (미확인)
- [x] 의도된 오류 3개 화면 확인 (요약 패널 좌석 수 불일치, 결제하기 버튼 무반응, 모바일 좌석 그리드 넘침 현상 확인)
- [x] 의도되지 않은 서버 오류 없음 확인

## 배포 진행
- [ ] 배포 설정 작성
- [ ] 배포 실행
- [ ] 배포 URL 확인
- [ ] 배포 후 오류 3개 재확인

## 의도된 오류 목록
- [x] site008-bug01 - 요약 패널 좌석 수 불일치 (state-mismatch)
- [x] site008-bug02 - 결제하기 버튼 무반응 (button-no-response)
- [x] site008-bug03 - 모바일 화면에서 좌석 그리드 넘침 (css-layout)
