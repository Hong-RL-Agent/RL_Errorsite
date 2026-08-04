# TODO - site060 Plant Care Website

## 1. 프로젝트 기반 설정
- [x] `site060` 폴더 생성 및 초기화
- [x] `package.json` 스크립트 및 `express` 설치
- [x] Express 서버(`server.js`) 및 API 엔드포인트 구현 (Plants, Tasks)

## 2. 디자인 및 레이아웃 (Plant Care 테마)
- [x] 포레스트그린 테마의 고품질 UI 스타일 가이드 정의
- [x] 히어로 섹션 및 메인 식물 그리드 레이아웃 구현
- [x] 사이드바 태스크 리스트 및 미니 캘린더 디자인
- [x] 식물 상세 정보 모달 UI 구현
- [x] 푸터 및 네비게이션 바 완성

## 3. 핵심 기능 구현 (Vanilla JS)
- [x] API 데이터 페칭 및 식물/태스크 리스트 연동
- [x] 식물 종류 필터링 및 이름 검색 기능
- [x] 상세 보기 모달 오픈 및 동적 데이터 렌더링
- [x] 지식 아코디언 인터랙션 구현
- [x] 태스크 완료 여부 토글 기능
- [x] 미구현 기능에 대한 "준비 중입니다" alert 연동

## 4. 의도된 GUI 오류 주입
- [x] `site060-bug01`: 필터링 시 식물 카드 중복 렌더링 오류 구현 (app.js)
- [x] `site060-bug02`: 특정 해상도에서 이미지-텍스트 레이아웃 겹침 오류 구현 (styles.css)
- [x] `site060-bug03`: 특정 식물의 물주기 버튼 이벤트 리스너 미연결 오류 구현 (app.js)
- [x] 각 오류 지점에 `data-bug-id` 및 `INTENTIONAL GUI BUG` 주석 추가

## 5. 최종 검증 및 문서화
- [x] `BUGS.md` 작성 및 오류 명세 기록
- [x] `README.md` 작성 및 프로젝트 안내
- [x] `npm start` 실행 및 전체 기능/오류 테스트
