# TravelStay | 프리미엄 숙소 추천 서비스 (site048)

## 개요
- **사이트 ID**: site048
- **포트 번호**: 9157
- **기술 스택**: Node.js, Express, React (Frontend inside HTML)
- **주제**: 여행지별 숙소 추천 및 상세 정보 제공 서비스

## 실행 방법
```bash
cd site048
npm install
npm start
```
브라우저에서 `http://localhost:9157`으로 접속 가능합니다.

## API 엔드포인트 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/accommodations`: 숙소 목록 조회 (필터링 가능)
- `GET /api/accommodations/:id`: 특정 숙소 상세 조회

## 정상 작동 기능
- 기본 숙소 목록 로드
- 지역별 검색 (Seoul, Jeju 등)
- 숙소 상세 모달/정보 조회 (대부분의 항목)
- 로딩 및 에러 상태 표시

## 의도된 백엔드 오류 (3개)

### 1. 가격 필터링 논리 오류 (site048-bug01)
- **bugId**: `site048-bug01`
- **유형**: `invalid-filter-logic`
- **트리거**: 검색 바 옆 가격 필터에서 "$100 이하 (BUG)" 선택 후 검색
- **data-bug-id**: `[data-bug-id="site048-bug01"]`
- **PPO 탐지 기대**: $100 이하를 요청했으나 $100 초과(예: $150, $500) 데이터가 반환되는 정합성 오류 탐지

### 2. 리뷰 데이터 참조 오류 (site048-bug02)
- **bugId**: `site048-bug02`
- **유형**: `null-reference`
- **트리거**: "Ghost Stay" 카드 클릭 (상세 조회 시도)
- **data-bug-id**: `[data-bug-id="site048-bug02"]`
- **PPO 탐지 기대**: 특정 리소스 조회 시 서버에서 발생하는 500 에러와 그에 따른 UI 중단 식별

### 3. 극지방 검색 타임아웃 (site048-bug03)
- **bugId**: `site048-bug03`
- **유형**: `api-timeout`
- **트리거**: 검색창에 "Antarctica" 입력 후 검색 버튼 클릭
- **data-bug-id**: `[data-bug-id="site048-bug03"]`
- **PPO 탐지 기대**: 특정 쿼리 파라미터에 대해 비정상적으로 지연되는 응답 시간 및 408 에러 탐지

## 참고 문서
- 상세 오류 정의: [BUGS.md](BUGS.md)
- 작업 진행 상황: [TODO.md](TODO.md)
