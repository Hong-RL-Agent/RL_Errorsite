# TODO.md — site081 MakeupShelf

## 프로젝트 설정
- [x] site081 폴더 생성
- [x] package.json (start, dev, build 스크립트)
- [x] Express 서버 (port 9410)
- [x] public/ 디렉터리 구조

## API 엔드포인트
- [x] GET /api/health
- [x] GET /api/products (brand, category, sort, q)
- [x] GET /api/products/:id
- [x] GET /api/expiring
- [x] GET /api/reviews/:productId
- [x] POST /api/reviews
- [x] GET /api/wishlist/:userId
- [x] POST /api/wishlist/toggle
- [x] GET /api/stats
- [x] GET /api/brands
- [x] GET /api/categories

## 의도된 오류
- [x] bug01 — database-date-query — 하한 체크 누락으로 만료 제품 포함
- [x] bug02 — network-missing-field — id:3, id:6 productId 필드 누락
- [x] bug03 — security-authorization — 위시리스트 소유자 검증 없음 (IDOR)
- [x] 각 오류 위에 INTENTIONAL BUG 주석 + data-bug-id

## 프론트엔드
- [x] 섹션 1: 제품 목록 (Hero, 필터, 그리드)
- [x] 섹션 2: 사용기한 임박 (날짜 범위 필터)
- [x] 섹션 3: 위시리스트 (IDOR 패널 포함)
- [x] 섹션 4: 통계 (카드, 카테고리 바, 브랜드 테이블)
- [x] 제품 상세 모달 (정보/리뷰/관리 탭)

## 인터랙션 (14개)
- [x] 제품 검색
- [x] 브랜드 필터 칩
- [x] 카테고리 필터 칩
- [x] 정렬 select
- [x] 위시리스트 토글 (🤍/❤️)
- [x] 제품 카드 → 상세 모달
- [x] 모달 탭 전환
- [x] 리뷰 작성 폼
- [x] 임박 제품 날짜 범위 선택
- [x] IDOR 위시리스트 조회
- [x] 통계 새로고침
- [x] 헤더 새로고침
- [x] 알림 벨 → 임박 뷰
- [x] 모달 닫기

## 문서화
- [x] README.md
- [x] BUGS.md
- [x] TODO.md

## 미완료
- [ ] 실제 사용자 인증 + 위시리스트 소유자 검증 (bug03 픽스)
- [ ] 만료일 필터 정상화 (bug01 픽스)
- [ ] productId 필드 복원 (bug02 픽스)
- [ ] 사진 업로드 기능
- [ ] 개봉 리마인더 알림
