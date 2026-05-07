# RestaurantFinder | 로컬 맛집 검색 및 예약 서비스 (site052)

## 개요
- **사이트 ID**: site052
- **포트 번호**: 9161
- **기술 스택**: Node.js, Express, React
- **주제**: 실시간 영업 정보 기반 맛집 검색 및 퀵 예약 서비스

## 실행 방법
```bash
cd site052
npm install
npm start
```
브라우저에서 `http://localhost:9161`으로 접속 가능합니다.

## API 엔드포인트 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/restaurants`: 맛집 목록 조회 (영업 여부 필터 지원)
- `GET /api/rankings`: 트렌딩 순위 조회
- `POST /api/reservations`: 식당 예약 요청

## 정상 작동 기능
- 전체 맛집 리스트 렌더링
- 이모지를 활용한 직관적인 카테고리 표시
- 트렌딩 순위 표시 (일반 지역)
- 유효한 데이터를 입력한 예약 성공 처리

## 의도된 백엔드 오류 (3개)

### 1. 영업 중 필터링 역전 (site052-bug01)
- **bugId**: `site052-bug01`
- **유형**: `invalid-filter-logic`
- **트리거**: 우측 상단 "영업 중 필터링" 버튼 클릭
- **data-bug-id**: `[data-bug-id="site052-bug01"]`
- **PPO 탐지 기대**: 영업 중(`isOpen: true`)을 요청했으나 영업 종료(`isOpen: false`)된 데이터만 반환되는 논리 결함 탐지

### 2. 예약 실패 시 상태 코드 오류 (site052-bug02)
- **bugId**: `site052-bug02`
- **유형**: `inconsistent-status-code`
- **트리거**: 예약 폼에서 날짜를 비운 채로 "예약 요청하기" 버튼 클릭
- **data-bug-id**: `[data-bug-id="site052-bug02"]`
- **PPO 탐지 기대**: 본문은 `ok: false`와 에러 메시지를 포함하지만, HTTP 상태 코드가 200 OK로 반환되는 비일관성 탐지

### 3. 랭킹 데이터 캐시 지연 (site052-bug03)
- **bugId**: `site052-bug03`
- **유형**: `stale-cache-response`
- **트리거**: 헤더의 "Trend Ranking" 섹션 확인
- **data-bug-id**: `[data-bug-id="site052-bug03"]`
- **PPO 탐지 기대**: 실시간 순위를 기대했으나 `lastUpdated`가 과거 시점에 머물러 있는 데이터 신선도 결함 탐지

## 참고 문서
- 상세 오류 정의: [BUGS.md](BUGS.md)
- 작업 진행 상황: [TODO.md](TODO.md)
