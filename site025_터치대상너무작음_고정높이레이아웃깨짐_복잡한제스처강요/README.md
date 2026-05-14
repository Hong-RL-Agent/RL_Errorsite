# QuickEats Desktop - 음식 배달 주문 플랫폼

## 정보
- 사이트 ID: site025
- 포트 번호: 9244
- 기술 스택: React, Vite, Express, Lucide-React
- 디자인 타겟: 1440px 데스크톱 웹 브라우저

## 실행 방법
1. `cd site025`
2. `npm install`
3. `npm run build`
4. `npm start`
5. http://localhost:9244 접속

## API 엔드포인트
- `GET /api/health`: 서버 상태 확인
- `GET /api/restaurants`: 식당 목록 (category, minRating 필터 지원)
- `GET /api/menus`: 메뉴 목록 (restaurantId 필터 지원)

## 정상 기능 목록
- 카테고리 드롭다운 및 좌측 사이드바 필터링
- 식당 검색 및 평점별 정렬
- 메뉴 상세 모달 팝업
- 우측 실시간 장바구니 요약 및 주문 합계 계산
- 데스크톱 최적화 3컬럼 레이아웃

## 의도된 프론트엔드 오류 3개
1. **[site025-bug01] 너무 작은 터치(클릭) 대상**: 수량 버튼이 20px로 매우 작음. (`src/components/MenuCard.jsx`)
2. **[site025-bug02] 고정 높이 레이아웃 깨짐**: 장바구니 패널 하단 결제 영역 잘림. (`src/components/CartSummaryPanel.jsx`)
3. **[site025-bug03] 복잡한 제스처 강요**: 쿠폰 삭제가 마우스 드래그로만 가능. (`src/components/CouponPanel.jsx`)

## PPO 에이전트 기대 행동
에이전트는 데스크톱 환경에서의 클릭 요소 크기 적절성, 콘텐츠 넘침(Overflow) 발생 시 주요 기능의 가용성, 그리고 제스처 중심 인터페이스의 불편함을 탐지해야 합니다.
