# TODO - site049 Blog Magazine

## 1. 프로젝트 초기화 및 환경 설정
- [x] 프로젝트 폴더 생성 (`site049`)
- [x] `package.json` 초기화 및 `express` 설치
- [x] `server.js` 서버 및 데이터 모킹 구현

## 2. 디자인 및 레이아웃 구현
- [x] `public/index.html` 매거진 스타일 구조 작성
- [x] `public/styles.css` 세이지 그린 / 잉크 블랙 테마 적용
- [x] Hero 섹션 및 2단 콘텐츠 레이아웃(Grid) 구현
- [x] 글 상세 모달 UI 및 스타일링

## 3. 프론트엔드 기능 구현 (Vanilla JS)
- [x] API 데이터(글, 태그) 페칭 및 렌더링
- [x] 태그 필터링 및 정렬 로직 구현
- [x] 제목/요약 검색 기능 구현
- [x] 모달 열기/닫기 인터랙션
- [x] 미구현 기능 클릭 시 "준비 중입니다" alert 적용

## 4. 의도된 GUI 오류 삽입
- [x] `site049-bug01`: 태그 필터 불일치 로직 구현
- [x] `site049-bug02`: 사이드바 본문 침범 레이아웃 구현
- [x] `site049-bug03`: 구독 버튼 이벤트 리스너 미연결 구현
- [x] 각 오류 코드 상단에 `INTENTIONAL GUI BUG` 주석 및 `data-bug-id` 추가

## 5. 검증 및 문서화
- [x] `README.md` 작성
- [x] `BUGS.md` 작성
- [x] 로컬 서버 실행 (`npm start`) 확인
- [x] 브라우저 테스트 및 오류 동작 확인
