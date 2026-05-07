# BUGS - site002

## site002-bug01
- type: null-reference
- API endpoint: GET /api/weather/detail
- 발생 조건: city=ghost-city 요청
- 관련 파일: server.js
- 관련 코드 위치: `/api/weather/detail` 라우트 내부
- data-bug-id selector: `[data-bug-id="site002-bug01"]`
- 사용자 증상: 에러 배너에 "Cannot read properties of undefined (reading 'value')" 등 500 에러 메시지가 표시됨
- 서버 응답 상태 코드: 500
- 서버 응답 예시:
  ```json
  {
    "ok": false,
    "bugId": "site002-bug01",
    "error": "Cannot read properties of undefined (reading 'value')"
  }
  ```
- 코드상 의도된 원인: `weatherData.detail['ghost-city']`가 undefined이므로 `.feelsLike.value`를 참조할 때 에러가 발생하도록 의도함
- PPO 기대 행동: 특정 입력 조건(ghost-city)에서만 발생하는 Null Reference API 오류를 탐지하고 해당 UI 상태 변화를 오류로 분류

## site002-bug02
- type: type-parsing
- API endpoint: GET /api/weather/forecast
- 발생 조건: days=abc 요청
- 관련 파일: server.js
- 관련 코드 위치: `/api/weather/forecast` 라우트 내부
- data-bug-id selector: `[data-bug-id="site002-bug02"]`
- 사용자 증상: 주간 예보 영역 상단 에러 배너에 "Invalid days parameter parsed as NaN" 에러 표시
- 서버 응답 상태 코드: 422
- 서버 응답 예시:
  ```json
  {
    "ok": false,
    "bugId": "site002-bug02",
    "error": "Invalid days parameter parsed as NaN"
  }
  ```
- 코드상 의도된 원인: 파라미터를 parseInt() 한 뒤 NaN 여부를 체크하여 422 상태 코드 반환
- PPO 기대 행동: 숫자 파라미터에 문자가 전달되었을 때의 타입 파싱 예외 처리 응답을 탐지

## site002-bug03
- type: api-timeout
- API endpoint: GET /api/weather/regions
- 발생 조건: region=slow-coast 요청
- 관련 파일: server.js
- 관련 코드 위치: `/api/weather/regions` 라우트 내부
- data-bug-id selector: `[data-bug-id="site002-bug03"]`
- 사용자 증상: 지역 정보 리스트가 약 6초간 계속 로딩되다가 결국 Timeout 에러 메시지를 표시함
- 서버 응답 상태 코드: 408
- 서버 응답 예시:
  ```json
  {
    "ok": false,
    "bugId": "site002-bug03",
    "error": "Request Timeout"
  }
  ```
- 코드상 의도된 원인: Promise setTimeout을 사용하여 해당 조건에서만 6초간 스레드를 멈춰두고 408을 리턴
- PPO 기대 행동: 특정 요청 조건에서만 발생하는 API Timeout 지연 현상과 그에 따른 에러를 탐지
