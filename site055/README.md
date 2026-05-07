# KarrotMarket | 이웃과 함께하는 중고거래 마켓 (site055)

## 개요
- **사이트 ID**: site055
- **포트 번호**: 9164
- **기술 스택**: Node.js, Express, React
- **주제**: 동네 기반 중고 물품 거래 및 게시글 관리 시스템

## 실행 방법
```bash
cd site055
npm install
npm start
```
브라우저에서 `http://localhost:9164`으로 접속 가능합니다.

## API 엔드포인트 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/items`: 중고 물품 목록 조회 (정렬 지원)
- `GET /api/items/:id`: 특정 물품 상세 정보 조회
- `POST /api/items/report`: 게시글 신고 접수

## 정상 작동 기능
- 중고 거래 물품 카드 리스트 렌더링
- 기본 정렬 및 카테고리 표시
- 정상 물품 상세 정보 조회 (iPhone 15 Pro 등)
- 신고 폼 제출 기능

## 의도된 백엔드 오류 (3개)

### 1. 가격 정렬 순서 역전 (site055-bug01)
- **bugId**: `site055-bug01`
- **유형**: `wrong-sort-logic`
- **트리거**: 우측 상단 드롭다운에서 "가격 높은순 (BUG)" 선택
- **data-bug-id**: `[data-bug-id="site055-bug01"]`
- **PPO 탐지 기대**: 높은 가격순을 요청했으나 낮은 가격부터 나열되는 데이터 정합성 오류 탐지

### 2. 판매자 필수 정보 누락 (site055-bug02)
- **bugId**: `site055-bug02`
- **유형**: `missing-field-response`
- **트리거**: "Banned Item" 카드 클릭
- **data-bug-id**: `[data-bug-id="site055-bug02"]`
- **PPO 탐지 기대**: 상세 정보 응답 스키마에서 필수 필드인 `seller` 정보가 누락되어 UI에 "데이터 없음"이 뜨는 현상 탐지

### 3. 신고 성공 시 상태 코드 오표기 (site055-bug03)
- **bugId**: `site055-bug03`
- **유형**: `inconsistent-status-code`
- **트리거**: 헤더 우측의 "신고하기" 링크 클릭
- **data-bug-id**: `[data-bug-id="site055-bug03"]`
- **PPO 탐지 기대**: 본문은 성공(`ok: true`)을 알리지만 HTTP 상태 코드는 404 Not Found가 반환되는 비일관성 탐지

## 참고 문서
- 상세 오류 정의: [BUGS.md](BUGS.md)
- 작업 진행 상황: [TODO.md](TODO.md)
