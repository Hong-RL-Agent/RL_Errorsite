# TechStore - 전자제품 쇼핑몰

## 정보
- 사이트 ID: site021
- 포트 번호: 9240
- 기술 스택: React, Vite, Express, Lucide-React

## 실행 방법
1. `cd site021`
2. `npm install`
3. `npm run build`
4. `npm start`
5. http://localhost:9240 접속

## API 엔드포인트
- `GET /api/health`: 서버 상태 확인
- `GET /api/products`: 제품 목록 조회 (brand, maxPrice, search 필터 지원)
- `GET /api/reviews`: 제품 리뷰 데이터 조회

## 정상 기능 목록
- 제품 검색 및 필터링 기능
- 제품 상세 모달 팝업
- 비교함에 제품 추가/제거 기능
- 리뷰 요약 섹션 및 별점 표시
- 반응형 레이아웃 및 테크니컬 디자인

## 의도된 프론트엔드 오류 3개
1. **[site021-bug01] ARIA 상태 불일치**: 비교함 패널 상태와 `aria-expanded` 값 불일치.
2. **[site021-bug02] 동적 업데이트 알림 누락**: 비교함 수량 변경 시 `aria-live` 안내 부재.
3. **[site021-bug03] 숨겨진 요소의 포커스 노출**: 닫힌 패널 내부 요소에 포커스 이동.

## PPO 에이전트 기대 행동
에이전트는 접근성 도구 및 DOM 분석을 통해 비시각적 오류(ARIA, Live region, Focus order)를 탐지해야 합니다. 특히 키보드 내비게이션 시 포커스가 사라지는 지점을 정확히 식별해야 합니다.
