# TODO - site054 Movie Review Site

## 1. 프로젝트 기반 설정
- [x] `site054` 폴더 생성 및 초기화
- [x] `package.json` 스크립트 및 `express` 설치
- [x] Express 서버(`server.js`) 및 API 엔드포인트 구현 (Movies, Reviews)

## 2. UI 및 디자인 (Cinema Magazine)
- [x] 다크네이비 & 골드 테마의 시네마 매거진 스타일 레이아웃 설계
- [x] Hero 섹션 및 영화 카드 그리드 구현
- [x] 우측 박스오피스 순위 Sticky 패널 스타일링
- [x] 리뷰 리스트 및 리뷰 작성 폼 디자인

## 3. 핵심 기능 구현 (Vanilla JS)
- [x] API 데이터 페칭 및 메인 화면 렌더링
- [x] 영화 제목 검색 및 장르별 필터링 기능
- [x] 영화 상세 정보 모달 연동
- [x] 별점 선택 UI 및 리뷰 정렬 로직 구현
- [x] 미구현 버튼 클릭 시 "준비 중입니다" alert 연동

## 4. 의도된 GUI 오류 주입
- [x] `site054-bug01`: 별점 렌더링 수치 오류 구현 (app.js)
- [x] `site054-bug02`: 리뷰 텍스트 오버플로우 레이아웃 오류 구현 (styles.css)
- [x] `site054-bug03`: 버튼 셀렉터 불일치로 인한 이벤트 리스너 미작동 (app.js)
- [x] 각 오류 지점에 `data-bug-id` 및 주석 추가

## 5. 최종 검증 및 문서화
- [x] `BUGS.md` 작성 및 오류 명세 기록
- [x] `README.md` 작성 및 프로젝트 안내
- [x] `npm start` 실행 및 전체 기능/오류 테스트 완료
