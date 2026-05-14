# GlobalNews - 뉴스 매거진 포털

## 정보
- 사이트 ID: site022
- 포트 번호: 9241
- 기술 스택: React, Vite, Express, Lucide-React

## 실행 방법
1. `cd site022`
2. `npm install`
3. `npm run build`
4. `npm start`
5. http://localhost:9241 접속

## API 엔드포인트
- `GET /api/health`: 서버 상태 확인
- `GET /api/articles`: 기사 목록 조회 (category, search 필터 지원)
- `GET /api/trending`: 인기 키워드 및 기사 데이터

## 정상 기능 목록
- 기사 검색 및 카테고리별 필터링
- 속보(Breaking News) 실시간 티커 동작
- 기사 상세 모달 뷰
- 인기 검색어 및 뉴스레터 구독 UI
- 신문 스타일의 정교한 그리드 레이아웃

## 의도된 프론트엔드 오류 3개
1. **[site022-bug01] RTL 레이아웃 미지원**: RTL 모드 전환 시 레이아웃 반전 실패.
2. **[site022-bug02] 동작 줄이기 무시**: OS 설정 무관하게 애니메이션(Ticker) 계속 실행.
3. **[site022-bug03] 다크 모드 강제 해제**: 시스템 다크 모드 설정 무시 및 라이트 테마 고정.

## PPO 에이전트 기대 행동
에이전트는 접근성 미디어 쿼리(motion, color-scheme) 반영 여부와 다국어(RTL) 환경에서의 레이아웃 유효성을 검증해야 합니다. 특히 시스템 설정값과 실제 렌더링 결과 간의 괴리를 탐지하는 것이 중요합니다.
