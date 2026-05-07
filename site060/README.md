# GrandEstate | 프리미엄 부동산 매물 정보 서비스 (site060)

## 개요
- **사이트 ID**: site060
- **포트 번호**: 9169
- **기술 스택**: Node.js, Express, React
- **주제**: 고급 주거 및 상업용 부동산 매물 검색 및 관리 시스템

## 실행 방법
```bash
cd site060
npm install
npm start
```
브라우저에서 `http://localhost:9169`으로 접속 가능합니다.

## API 엔드포인트 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/properties`: 매물 목록 조회 (최소 방 개수 필터 지원)
- `GET /api/properties/premium`: 프리미엄 매물 목록 조회
- `POST /api/properties/save`: 새로운 매물 정보 저장(초안)

## 정상 작동 기능
- 럭셔리 스타일의 부동산 매물 카드 리스트 렌더링
- 전체 매물 조회 및 기본 정보(가격, 방 개수, 타입) 표시
- 반응형 웹 디자인 (Mobile/Desktop 최적화)
- 유효한 데이터를 포함한 매물 저장 기능

## 의도된 백엔드 오류 (3개)

### 1. 방 개수 필터링 논리 오류 (site060-bug01)
- **bugId**: `site060-bug01`
- **유형**: `invalid-filter-logic`
- **트리거**: 헤더 네비게이션에서 "Rent (3+ Rooms)" 클릭
- **data-bug-id**: `[data-bug-id="site060-bug01"]`
- **PPO 탐지 기대**: 방 3개 이상을 요청했으나 방 1~2개인 소형 매물만 반환되는 논리적 결함 탐지

### 2. 프리미엄 매물 로드 타임아웃 (site060-bug02)
- **bugId**: `site060-bug02`
- **유형**: `api-timeout`
- **트리거**: 헤더 네비게이션에서 "Premium" 클릭
- **data-bug-id**: `[data-bug-id="site060-bug02"]`
- **PPO 탐지 기대**: 특정 요청 시 발생하는 6초 이상의 비정상적 지연 및 408 타임아웃 상태 식별

### 3. 매물 저장 실패 시 상태 코드 오류 (site060-bug03)
- **bugId**: `site060-bug03`
- **유형**: `inconsistent-status-code`
- **트리거**: 헤더 네비게이션 우측의 "Sell" 버튼 클릭
- **data-bug-id**: `[data-bug-id="site060-bug03"]`
- **PPO 탐지 기대**: 필수 필드(제목) 누락으로 인해 본문은 실패(`ok: false`)를 반환하지만 HTTP 상태 코드는 200 OK인 비일관성 탐지

## 참고 문서
- 상세 오류 정의: [BUGS.md](BUGS.md)
- 작업 진행 상황: [TODO.md](TODO.md)
