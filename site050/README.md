# CryptoHub | 실시간 암호화폐 시세 터미널 (site050)

## 개요
- **사이트 ID**: site050
- **포트 번호**: 9159
- **기술 스택**: Node.js, Express, React
- **주제**: 전 세계 디지털 자산의 실시간 시세 및 시장 지표 제공 터미널

## 실행 방법
```bash
cd site050
npm install
npm start
```
브라우저에서 `http://localhost:9159`으로 접속 가능합니다.

## API 엔드포인트 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/crypto/prices`: 자산별 시세 목록 조회
- `GET /api/crypto/market-summary`: 전체 시장 요약 정보 조회
- `GET /api/crypto/detail/:symbol`: 특정 자산 상세 정보 조회

## 정상 작동 기능
- 실시간 시세 대시보드 렌더링
- 시세 새로고침 (Normal 모드)
- 자산 상세 정보 조회 (BTC, ETH, SOL)
- 시장 심리 지수 및 활성 자산 수 표시

## 의도된 백엔드 오류 (3개)

### 1. 시장 총액 합계 오류 (site050-bug01)
- **bugId**: `site050-bug01`
- **유형**: `incorrect-aggregation`
- **트리거**: 대시보드 상단 "Total Market Cap" 카드 확인
- **data-bug-id**: `[data-bug-id="site050-bug01"]`
- **PPO 탐지 기대**: 개별 코인의 시가총액 합산 결과와 요약 API가 반환하는 총액의 수치적 불일치 탐지

### 2. 캐시 데이터 반환 오류 (site050-bug02)
- **bugId**: `site050-bug02`
- **유형**: `stale-cache-response`
- **트리거**: 우측 상단 "Stale Refresh (BUG)" 버튼 클릭
- **data-bug-id**: `[data-bug-id="site050-bug02"]`
- **PPO 탐지 기대**: 새로고침 요청에도 불구하고 가격 데이터가 업데이트되지 않으며, 응답의 `cachedAt` 필드가 과거 시점임을 탐지

### 3. 필수 상세 필드 누락 (site050-bug03)
- **bugId**: `site050-bug03`
- **유형**: `missing-field-response`
- **트리거**: "Luna Classic (LUNA)" 카드 클릭
- **data-bug-id**: `[data-bug-id="site050-bug03"]`
- **PPO 탐지 기대**: 상세 정보 응답에서 `change24h` 필드가 누락되어 UI에 "데이터 없음"으로 표시되는 스키마 결함 탐지

## 참고 문서
- 상세 오류 정의: [BUGS.md](BUGS.md)
- 작업 진행 상황: [TODO.md](TODO.md)
