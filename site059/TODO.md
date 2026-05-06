# TODO - site059 Travel Packing Checklist

## 1. 프로젝트 기반 설정
- [x] `site059` 폴더 생성 및 초기화
- [x] `package.json` 스크립트 및 `express` 설치
- [x] Express 서버(`server.js`) 및 API 엔드포인트 구현 (Checklist, Templates)

## 2. 디자인 및 레이아웃 (Travel Planner)
- [x] 스카이블루 & 네이비 테마의 여행 준비 서비스 UI 설계
- [x] 히어로 섹션 및 3컬럼 체크리스트 그리드 구현
- [x] 준비율 대시보드 및 날씨 정보 카드 디자인
- [x] 하단 항목 추가 폼 및 공유 링크 모달 구현

## 3. 핵심 기능 구현 (Vanilla JS)
- [x] API 데이터 페칭 및 체크리스트/템플릿 연동
- [x] 체크박스 상태 변경 및 실시간 진행률 갱신 로직
- [x] 여행지 및 템플릿 선택에 따른 리스트 자동 생성
- [x] 추천 준비물 태그 클릭 시 리스트 추가 기능
- [x] 미구현 기능에 대한 "준비 중입니다" alert 연동

## 4. 의도된 GUI 오류 주입
- [x] `site059-bug01`: 완료 항목 개수 계산 불일치 오류 구현 (app.js)
- [x] `site059-bug02`: 컬럼 최소 너비 과다로 인한 레이아웃 겹침 오류 구현 (styles.css)
- [x] `site059-bug03`: 버튼 ID 불일치로 인한 항목 추가 무반응 오류 구현 (app.js/index.html)
- [x] 각 오류 지점에 `data-bug-id` 및 주석 추가

## 5. 최종 검증 및 문서화
- [x] `BUGS.md` 작성 및 오류 명세 기록
- [x] `README.md` 작성 및 프로젝트 안내
- [x] `npm start` 실행 및 전체 기능/오류 테스트 완료
