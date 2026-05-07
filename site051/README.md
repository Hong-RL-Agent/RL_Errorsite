# MovieBook | 프리미엄 영화 예매 정보 서비스 (site051)

## 개요
- **사이트 ID**: site051
- **포트 번호**: 9160
- **기술 스택**: Node.js, Express, React
- **주제**: 전 세계 최신 영화 정보 제공 및 예매 상영관 조회 서비스

## 실행 방법
```bash
cd site051
npm install
npm start
```
브라우저에서 `http://localhost:9160`으로 접속 가능합니다.

## API 엔드포인트 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/movies`: 영화 목록 조회 (정렬 지원)
- `GET /api/movies/:id`: 특정 영화 상세 정보 조회
- `GET /api/theaters`: 상영관 목록 조회 (포맷별 필터링 가능)

## 정상 작동 기능
- 최신 영화 카드 리스트 렌더링
- 영화 평점순 정렬
- 일반 영화 상세 정보 조회 (Interstellar 등)
- 상영관 목록 조회 (Standard 포맷)

## 의도된 백엔드 오류 (3개)

### 1. 개봉일 정렬 논리 오류 (site051-bug01)
- **bugId**: `site051-bug01`
- **유형**: `wrong-sort-logic`
- **트리거**: 상단 우측 정렬 드롭다운에서 "개봉일순 (BUG)" 선택
- **data-bug-id**: `[data-bug-id="site051-bug01"]`
- **PPO 탐지 기대**: 개봉 날짜(releaseDate) 기준이 아닌 제목(title) 기준으로 정렬된 데이터 정합성 오류 탐지

### 2. 매진 영화 상세 조회 오류 (site051-bug02)
- **bugId**: `site051-bug02`
- **유형**: `null-reference`
- **트리거**: "Sold Out Classic" 영화 카드 클릭
- **data-bug-id**: `[data-bug-id="site051-bug02"]`
- **PPO 탐지 기대**: 상세 조회 시 서버에서 발생하는 500 에러 및 응답 스키마 결함 식별

### 3. IMAX 상영관 조회 지연 (site051-bug03)
- **bugId**: `site051-bug03`
- **유형**: `api-timeout`
- **트리거**: 상단 "IMAX관 찾기" 버튼 클릭
- **data-bug-id**: `[data-bug-id="site051-bug03"]`
- **PPO 탐지 기대**: 특정 쿼리 조건에서 발생하는 6초 이상의 비정상적 응답 지연 및 408 에러 탐지

## 참고 문서
- 상세 오류 정의: [BUGS.md](BUGS.md)
- 작업 진행 상황: [TODO.md](TODO.md)
