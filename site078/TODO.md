# TODO.md — site078 FoodTruck Map

## 프로젝트 설정

- [x] site078 폴더 생성
- [x] package.json 작성 (start, dev, build 스크립트 포함)
- [x] Express 서버 구성 (port 9407)
- [x] public/ 디렉터리 구조 생성
- [x] npm install 후 npm start 실행 가능 확인

## API 엔드포인트

- [x] GET /api/health
- [x] GET /api/trucks (region, open, sort, q 파라미터 지원)
- [x] GET /api/menus/:truckId
- [x] GET /api/favorites
- [x] POST /api/favorites/toggle
- [x] GET /api/reviews/:truckId
- [x] POST /api/reviews
- [x] GET /api/regions

## 의도된 오류 구현

- [x] bug01 — DB 영업시간 비교 오류 (database-date-query) — `isOpenNow_buggy()` closeTime 누락
- [x] bug02 — 네트워크 위치 응답 누락 (network-missing-field) — lat/lng 필드 제거
- [x] bug03 — 리뷰 작성 인증 누락 (security-authentication) — POST /api/reviews 인증 없음
- [x] 각 오류 코드 바로 위에 INTENTIONAL BUG 주석 작성
- [x] 각 오류 위치에 data-bug-id 속성 부착

## 프론트엔드 구현

- [x] 섹션 1: Hero (검색창, 통계)
- [x] 섹션 2: 필터 바 (지역, 영업중, 정렬)
- [x] 섹션 3: 푸드트럭 목록 (그리드)
- [x] 섹션 4: 지도 (커스텀 마커 시각화)
- [x] 섹션 5: 즐겨찾기
- [x] 섹션 6: 리뷰

## 인터랙션 구현 (10개 이상)

- [x] 검색 (키워드 검색)
- [x] 지역 필터 (칩 선택)
- [x] 영업중 필터 (토글 버튼)
- [x] 정렬 (select)
- [x] 트럭 카드 클릭 → 모달 오픈
- [x] 탭 전환 (메뉴/영업정보/리뷰)
- [x] 즐겨찾기 추가/제거 (⭐ 토글)
- [x] 리뷰 작성 폼 제출
- [x] 지도 마커 클릭 → 사이드바 정보
- [x] 전체 새로고침 버튼
- [x] 모달 닫기 (✕, 오버레이, ESC)
- [x] 모바일 메뉴 토글
- [x] 영업 상태 배지 표시
- [x] 토스트 알림

## 문서화

- [x] README.md 작성
- [x] BUGS.md 작성
- [x] TODO.md 작성

## 미완료 / 향후 개선 사항

- [ ] 실제 지도 API 연동 (Kakao Map, Google Maps)
- [ ] 사용자 인증 시스템 (JWT, 세션)
- [ ] 실시간 영업 상태 WebSocket 업데이트
- [ ] 트럭 등록 / 관리자 기능
- [ ] 이미지 업로드 기능
- [ ] 페이지네이션 구현
