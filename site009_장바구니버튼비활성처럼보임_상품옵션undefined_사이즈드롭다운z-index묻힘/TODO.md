# TODO - site009

## 생성 진행
- [x] 프로젝트 폴더 생성
- [x] package.json 작성
- [x] Express 서버 작성 (server.js)
- [x] API 엔드포인트 작성 (/api/health, /api/categories, /api/products)
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
- [x] npm start 확인 (Express 서버 포트 9228 실행 확인)
- [x] 브라우저 접속 확인 (http://localhost:9228 — BLANC & NOIR 패션 쇼핑몰 렌더링)
- [ ] /api/health 확인 (미확인)
- [x] 의도된 오류 3개 화면 확인 (버튼 비활성화 UI 혼동, undefined 텍스트, 드롭다운 잘림 현상 확인)
- [x] 의도되지 않은 서버 오류 없음 확인

## 배포 진행
- [ ] 배포 설정 작성
- [ ] 배포 실행
- [ ] 배포 URL 확인
- [ ] 배포 후 오류 3개 재확인

## 의도된 오류 목록
- [x] site009-bug01 - 장바구니 버튼 비활성화 상태처럼 보임 (form-ui)
- [x] site009-bug02 - 상품 옵션 텍스트 undefined 렌더링 (component-rendering)
- [x] site009-bug03 - 사이즈 드롭다운 Z-index 묻힘 현상 (dropdown-layout)
