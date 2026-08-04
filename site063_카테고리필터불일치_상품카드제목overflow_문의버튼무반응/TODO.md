# TODO - site063 Neighborhood Market

## 1. 프로젝트 기반 설정
- [x] `site063` 폴더 생성 및 초기화
- [x] `package.json` 스크립트 및 `express` 설치
- [x] Express 서버(`server.js`) 및 API 엔드포인트 구현 (Items, Regions)

## 2. 디자인 및 레이아웃 (Marketplace 테마)
- [x] 오렌지 메인 컬러 기반의 친근한 지역 마켓 UI 구현
- [x] 히어로 배너 및 메인 상품 그리드 레이아웃 완성
- [x] 사이드바 안전 가이드 및 인기 검색어 패널 디자인
- [x] 카테고리 필터 칩 인터페이스 구현
- [x] 상품 상세 모달 UI 제작

## 3. 핵심 기능 구현 (Vanilla JS)
- [x] API 데이터 연동 및 상품/지역 정보 동적 렌더링
- [x] 지역별, 카테고리별 상품 필터링 로직 구현
- [x] 상품 검색 기능 연동
- [x] 상세 모달 오픈 및 데이터 바인딩
- [x] 미구현 버튼에 대한 alert 연동

## 4. 의도된 GUI 오류 주입
- [x] `site063-bug01`: 가전 카테고리 선택 시 가구 상품 혼입 오류 구현 (app.js)
- [x] `site063-bug02`: 긴 상품명에 대한 카드 레이아웃 오버플로우 오류 구현 (styles.css)
- [x] `site063-bug03`: 특정 매물(에어팟) 문의 버튼 이벤트 누락 오류 구현 (app.js)
- [x] 각 오류 지점에 `data-bug-id` 및 `INTENTIONAL GUI BUG` 주석 추가

## 5. 최종 검증 및 문서화
- [x] `BUGS.md` 및 `README.md` 작성 완료
- [x] `npm start` 실행 및 전체 기능/오류 테스트 완료
