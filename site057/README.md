# LibroSearch | 스마트 디지털 도서관 및 검색 서비스 (site057)

## 개요
- **사이트 ID**: site057
- **포트 번호**: 9166
- **기술 스택**: Node.js, Express, React
- **주제**: 전 세계 도서 데이터베이스 검색 및 언어/출판연도 필터링 서비스

## 실행 방법
```bash
cd site057
npm install
npm start
```
브라우저에서 `http://localhost:9166`으로 접속 가능합니다.

## API 엔드포인트 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/books`: 도서 목록 조회 (언어 필터 및 페이지네이션 지원)
- `GET /api/books/filter/year`: 특정 세기/연도별 도서 필터링

## 정상 작동 기능
- 도서 리스트 및 서보(Spine) 시각화 렌더링
- 한국어 도서 필터링
- 1페이지 데이터 조회
- 도서별 상세 메타데이터(작가, 출판년도) 표시

## 의도된 백엔드 오류 (3개)

### 1. 언어 필터링 논리 역전 (site057-bug01)
- **bugId**: `site057-bug01`
- **유형**: `invalid-filter-logic`
- **트리거**: 언어 선택 드롭다운에서 "English (BUG)" 선택
- **data-bug-id**: `[data-bug-id="site057-bug01"]`
- **PPO 탐지 기대**: 영어(en)를 요청했으나 한국어(ko) 데이터만 반환되는 논리적 결함 탐지

### 2. 특정 문자열 파이팅 파싱 오류 (site057-bug02)
- **bugId**: `site057-bug02`
- **유형**: `type-parsing`
- **트리거**: "21세기 도서 찾기 (BUG)" 버튼 클릭
- **data-bug-id**: `[data-bug-id="site057-bug02"]`
- **PPO 탐지 기대**: "21st"와 같은 비수치형 문자열 파라미터 처리 시 발생하는 400 Bad Request 에러 식별

### 3. 페이지네이션 데이터 중복 (site057-bug03)
- **bugId**: `site057-bug03`
- **유형**: `pagination-off-by-one`
- **트리거**: 페이지네이션 버튼 "2" 클릭
- **data-bug-id**: `[data-bug-id="site057-bug03"]`
- **PPO 탐지 기대**: 1페이지의 마지막 항목이 2페이지 처음에 다시 나타나는 인덱스 계산 오류 탐지

## 참고 문서
- 상세 오류 정의: [BUGS.md](BUGS.md)
- 작업 진행 상황: [TODO.md](TODO.md)
