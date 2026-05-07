# SkyCast | 글로벌 실시간 기상 예보 서비스 (site059)

## 개요
- **사이트 ID**: site059
- **포트 번호**: 9168
- **기술 스택**: Node.js, Express, React (Glassmorphism UI)
- **주제**: 전 세계 주요 도시 및 지역의 실시간 기상 상태 모니터링 시스템

## 실행 방법
```bash
cd site059
npm install
npm start
```
브라우저에서 `http://localhost:9168`으로 접속 가능합니다.

## API 엔드포인트 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/weather/current`: 특정 지역의 현재 날씨 조회
- `GET /api/weather/detail`: 특정 도시의 상세 기상 정보(풍속, 습도 등) 조회
- `GET /api/weather/coords`: 위경도 좌표 유효성 검사

## 정상 작동 기능
- 글래스모피즘(Glassmorphism) 기반의 수려한 날씨 대시보드 렌더링
- 서울(Seoul), 런던(London) 등 주요 도시 날씨 정보 로드
- 기상 상태에 따른 동적 아이콘 표시
- 위성 동기화 상태 로딩 애니메이션

## 의도된 백엔드 오류 (3개)

### 1. 유령 도시 상세 정보 참조 오류 (site059-bug01)
- **bugId**: `site059-bug01`
- **유형**: `null-reference`
- **트리거**: 메인 대시보드 하단 "Unknown City" 버튼 클릭
- **data-bug-id**: `[data-bug-id="site059-bug01"]`
- **PPO 탐지 기대**: `detail` 정보가 없는 도시에 대해 상세 속성 접근 시 발생하는 서버 내부 에러(500) 식별

### 2. 북극 지역 데이터 조회 지연 (site059-bug02)
- **bugId**: `site059-bug02`
- **유형**: `api-timeout`
- **트리거**: 헤더의 "ARCTIC FEED" 버튼 클릭
- **data-bug-id**: `[data-bug-id="site059-bug02"]`
- **PPO 탐지 기대**: 특정 쿼리 조건에서 발생하는 6초 이상의 비정상적 응답 지연 및 408 타임아웃 상태 탐지

### 3. 좌표 데이터 타입 파싱 오류 (site059-bug03)
- **bugId**: `site059-bug03`
- **유형**: `type-parsing`
- **트리거**: 헤더의 "FIND COORDS" 버튼 클릭
- **data-bug-id**: `[data-bug-id="site059-bug03"]`
- **PPO 탐지 기대**: 비수치형 데이터("N/A") 요청 시 발생하는 422 Unprocessable Entity 에러 응답 식별

## 참고 문서
- 상세 오류 정의: [BUGS.md](BUGS.md)
- 작업 진행 상황: [TODO.md](TODO.md)
