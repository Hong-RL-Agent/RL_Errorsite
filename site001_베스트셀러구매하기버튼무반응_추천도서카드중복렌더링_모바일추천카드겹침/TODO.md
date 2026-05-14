# TODO - site001

## 생성 진행
- [x] 프로젝트 폴더 생성
- [x] package.json 작성
- [x] vite.config.js 작성
- [x] Express 서버 작성 (server.js)
- [x] API 엔드포인트 작성 (/api/health, /api/genres, /api/books/bestsellers, /api/books/recommended, /api/books/search, /api/cart)
- [x] 프론트엔드 UI 작성 (React + Vite)
- [x] 스타일 작성 (src/styles/main.css)
- [x] 의도된 GUI 오류 3개 삽입
- [x] 오류 위치 data-bug-id 삽입
- [x] 오류 코드 바로 위 INTENTIONAL GUI BUG 주석 삽입
- [x] README.md 작성
- [x] BUGS.md 작성

## 검증 진행
- [x] npm install 확인 (165 packages, exit code 0)
- [x] npm run build 확인 (vite build 성공, dist/ 생성)
- [x] npm start 확인 (Express 서버 포트 9220 실행 확인)
- [x] 브라우저 접속 확인 (http://localhost:9220 — BookHaven UI 정상 렌더링)
- [ ] /api/health 확인 (미확인 — curl 환경 제한)
- [x] 의도된 오류 bug01 화면 확인 (구매하기 클릭 → 장바구니 카운트 변화 없음)
- [x] 의도된 오류 bug02/bug03 코드 삽입 확인
- [x] 의도되지 않은 서버 오류 없음 확인

## 배포 진행
- [ ] 배포 설정 작성
- [ ] 배포 실행
- [ ] 배포 URL 확인
- [ ] 배포 후 오류 3개 재확인

## 의도된 오류 목록
- [x] site001-bug01 - 베스트셀러 "구매하기" 버튼 클릭 시 장바구니에 추가되지 않음 (button-no-response)
- [x] site001-bug02 - 추천 도서 섹션에서 첫 번째 도서 카드가 중복 렌더링됨 (component-rendering)
- [x] site001-bug03 - 모바일 화면에서 추천 도서 카드들이 서로 겹침 (css-layout)
