# OnlineEdu | 글로벌 온라인 학습 플랫폼 (site053)

## 개요
- **사이트 ID**: site053
- **포트 번호**: 9162
- **기술 스택**: Node.js, Express, React
- **주제**: IT, 디자인, 마케팅 등 다양한 분야의 온라인 강의 제공 플랫폼

## 실행 방법
```bash
cd site053
npm install
npm start
```
브라우저에서 `http://localhost:9162`으로 접속 가능합니다.

## API 엔드포인트 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/courses`: 전체 강의 목록 (페이지네이션 지원)
- `GET /api/courses/:id`: 특정 강의 상세 정보
- `GET /api/stats/category-average`: 카테고리별 평균 평점 통계

## 정상 작동 기능
- 고충실도 강의 리스트 대시보드 렌더링
- 페이지네이션 이동 (2페이지 정상)
- 일반 강의 상세 정보 조회 (ID 101~106)
- 사이드바 통계 정보 로드

## 의도된 백엔드 오류 (3개)

### 1. 페이지네이션 수량 불일치 (site053-bug01)
- **bugId**: `site053-bug01`
- **유형**: `pagination-off-by-one`
- **트리거**: 1페이지 리스트 확인 (기본 로드)
- **data-bug-id**: `[data-bug-id="site053-bug01"]`
- **PPO 탐지 기대**: `limit=5`를 요청했으나 서버가 4개의 항목만 반환하는 데이터 누락 결함 탐지

### 2. 강의 ID 타입 파싱 오류 (site053-bug02)
- **bugId**: `site053-bug02`
- **유형**: `type-parsing`
- **트리거**: 사이드바의 "My Learning (BUG)" 버튼 클릭
- **data-bug-id**: `[data-bug-id="site053-bug02"]`
- **PPO 탐지 기대**: 문자열 ID를 부적절하게 처리하여 발생하는 서버 내부 에러(500) 및 TypeError 식별

### 3. 평점 통계 계산 오류 (site053-bug03)
- **bugId**: `site053-bug03`
- **유형**: `incorrect-aggregation`
- **트리거**: 사이드바 상단 "Avg Course Rating" 영역 확인
- **data-bug-id**: `[data-bug-id="site053-bug03"]`
- **PPO 탐지 기대**: 실제 강의 데이터셋의 평점 평균과 API가 반환하는 통계 수치(무조건 5.0)의 불일치 탐지

## 참고 문서
- 상세 오류 정의: [BUGS.md](BUGS.md)
- 작업 진행 상황: [TODO.md](TODO.md)
