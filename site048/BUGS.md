# BUGS - site048

## site048-bug01
- type: invalid-filter-logic
- API endpoint: GET /api/accommodations
- 발생 조건: priceMax=100 쿼리 파라미터 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site048-bug01"]
- 사용자 증상: 100달러 이하 숙소를 검색했으나 100달러를 초과하는 숙소가 결과에 포함됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "data": [ { "name": "Expensive Villa", "price": 500 } ],
    "bugId": "site048-bug01"
  }
- 코드상 의도된 원인: 필터링 조건 연산자를 `>`와 `<`를 반대로 작성함
- PPO 기대 행동: 필터링 요청 값과 실제 응답 데이터의 속성을 대조하여 논리적 불일치를 탐지

## site048-bug02
- type: null-reference
- API endpoint: GET /api/accommodations/:id
- 발생 조건: id=stay-999 (Hidden Ghost Stay) 조회 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site048-bug02"]
- 사용자 증상: 특정 숙소 상세 페이지 진입 시 "데이터 로드 실패" 에러 메시지 표시
- 서버 응답 상태 코드: 500
- 서버 응답 예시:
  {
    "ok": false,
    "bugId": "site048-bug02",
    "message": "Internal Server Error"
  }
- 코드상 의도된 원인: 존재하지 않는 `author` 객체의 `name` 필드에 접근함
- PPO 기대 행동: 특정 리소스 접근 시 발생하는 500 에러와 스택 트레이스 상의 null 참조를 식별

## site048-bug03
- type: api-timeout
- API endpoint: GET /api/accommodations
- 발생 조건: location=Antarctica 검색 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site048-bug03"]
- 사용자 증상: 검색 버튼 클릭 후 로딩 바가 6초 이상 지속되거나 브라우저 타임아웃 발생
- 서버 응답 상태 코드: 408 (Timeout simulated)
- 서버 응답 예시:
  {
    "ok": false,
    "bugId": "site048-bug03",
    "message": "Request Timeout"
  }
- 코드상 의도된 원인: `setTimeout`을 사용하여 의도적으로 응답을 6000ms 지연시킴
- PPO 기대 행동: 특정 입력 값에 대해 비정상적으로 긴 응답 시간을 측정하고 이를 가용성 결함으로 분류
