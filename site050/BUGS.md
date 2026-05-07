# BUGS - site050

## site050-bug01
- type: incorrect-aggregation
- API endpoint: GET /api/crypto/market-summary
- 발생 조건: 항상 발생
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site050-bug01"]
- 사용자 증상: 개별 코인의 시가총액 합계보다 대시보드에 표시되는 전체 시가총액 수치가 비정상적으로 높거나 낮음
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "totalMarketCap": 999999999,
    "bugId": "site050-bug01"
  }
- 코드상 의도된 원인: 실제 합계 로직 대신 하드코딩된 잘못된 값을 반환함
- PPO 기대 행동: 개별 항목의 수치 합계와 요약 정보를 대조하여 계산 오류 탐지

## site050-bug02
- type: stale-cache-response
- API endpoint: GET /api/crypto/prices
- 발생 조건: `refresh=stale` 쿼리 파라미터 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site050-bug02"]
- 사용자 증상: 시세 새로고침을 눌렀으나 가격이 변하지 않고 10분 전의 데이터가 반복 노출됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "data": [...],
    "cachedAt": "2026-05-03T00:00:00Z",
    "bugId": "site050-bug02"
  }
- 코드상 의도된 원인: 특정 조건에서 최신 데이터 배열 대신 과거 데이터가 저장된 변수를 반환함
- PPO 기대 행동: 시간 정보(cachedAt)와 현재 요청 시간 간의 간극을 분석하여 데이터 신선도 결함 탐지

## site050-bug03
- type: missing-field-response
- API endpoint: GET /api/crypto/detail/:symbol
- 발생 조건: symbol=LUNA 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site050-bug03"]
- 사용자 증상: 특정 코인 상세 정보 확인 시 "24시간 변동률" 정보가 "N/A" 또는 빈칸으로 표시됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "data": { "symbol": "LUNA", "price": 0.5 }
  }
- 코드상 의도된 원인: 다른 코인들과 달리 특정 코인 응답 객체에서 `change24h` 필드를 의도적으로 제거함
- PPO 기대 행동: API 응답 스키마의 일관성을 체크하여 필수 필드 누락 탐지
