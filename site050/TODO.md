# TODO - site050 Course Catalog

## 1. 프로젝트 기반 설정
- [x] `site050` 폴더 생성 및 초기화
- [x] `package.json` 및 의존성(`express`) 설치
- [x] Express 서버(`server.js`) 구현 및 데이터 모킹

## 2. 레이아웃 및 디자인
- [x] `public/index.html` 교육 플랫폼 레이아웃 작성
- [x] `public/styles.css` 인디고 테마 스타일링
- [x] Hero 섹션 및 필터 사이드바 디자인
- [x] 강좌 카드 및 강사 소개 카드 컴포넌트화

## 3. 핵심 기능 구현 (Vanilla JS)
- [x] API 데이터 페칭 및 그리드 렌더링
- [x] 분야(Category) 및 난이도(Difficulty) 다중 필터링
- [x] 실시간 강좌 제목/강사명 검색
- [x] 강좌 상세 정보 모달 연동
- [x] 미구현 버튼 클릭 시 "준비 중입니다" alert 연동

## 4. 의도된 오류 주입
- [x] `site050-bug01`: 데이터 누락으로 인한 `undefined` 렌더링 오류
- [x] `site050-bug02`: 긴 제목 대응 부재로 인한 카드 레이아웃 붕괴
- [x] `site050-bug03`: 특정 강좌의 담기 버튼 이벤트 리스너 누락
- [x] 각 오류 지점에 `data-bug-id` 및 주석 추가

## 5. 최종 완료 및 문서화
- [x] `BUGS.md` 작성
- [x] `README.md` 작성
- [x] `npm start` 실행 및 전체 기능/오류 테스트
