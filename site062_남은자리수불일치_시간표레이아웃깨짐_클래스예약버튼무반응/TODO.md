# TODO - site062 Yoga Booking Website

## 1. 프로젝트 기반 설정
- [x] `site062` 폴더 생성 및 초기화
- [x] `package.json` 스크립트 및 `express` 설치
- [x] Express 서버(`server.js`) 및 API 엔드포인트 구현 (Classes, Instructors)

## 2. 디자인 및 레이아웃 (Wellness 테마)
- [x] 세이지그린 기반의 웰니스 브랜드 UI 스타일 가이드 적용
- [x] 히어로 섹션 및 메인 클래스 그리드 레이아웃 구현
- [x] 주간 시간표 및 탭 전환 인터페이스 구현
- [x] 예약 요약 사이드바 및 후기 섹션 디자인
- [x] 멤버십 안내 아코디언 구현

## 3. 핵심 기능 구현 (Vanilla JS)
- [x] API 데이터 페칭 및 클래스/강사 리스트 동적 렌더링
- [x] 난이도 및 강사별 클래스 필터링 기능
- [x] 클래스 선택 시 예약 요약 패널 실시간 업데이트 로직
- [x] 요일별 시간표 전환 토글 (Mock)
- [x] 멤버십 아코디언 개폐 인터랙션

## 4. 의도된 GUI 오류 주입
- [x] `site062-bug01`: 카드-요약 패널 간 남은 자리 수 불일치 오류 구현 (app.js)
- [x] `site062-bug02`: 시간표 grid 폭 고정 및 overflow 누락 레이아웃 오류 구현 (styles.css)
- [x] `site062-bug03`: 특정 인기 클래스 예약 버튼 이벤트 리스너 미연결 오류 구현 (app.js)
- [x] 각 오류 지점에 `data-bug-id` 및 `INTENTIONAL GUI BUG` 주석 추가

## 5. 최종 검증 및 문서화
- [x] `BUGS.md` 및 `README.md` 작성 완료
- [x] `npm start` 실행 및 전체 기능/오류 테스트 완료
