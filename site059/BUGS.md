# BUGS - site059

## site059-bug01
- type: null-reference
- API endpoint: GET /api/weather/detail
- 발생 조건: `city=ghost-city` 쿼리 파라미터 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site059-bug01"]
- 사용자 증상: 유령 도시 날씨 조회 시 상세 기상 정보(풍속 등)를 불러오지 못하고 서버 에러 발생
- 서버 응답 상태 코드: 500
- 서버 응답 예시:
  {
    "ok": false,
    "bugId": "site059-bug01",
    "message": "Internal Server Error"
  }
- 코드상 의도된 원인: `detail` 객체가 null인 상태에서 하위 필드(`wind.speed`)에 접근함
- PPO 기대 행동: 특정 입력 값에 대해 발생하는 500 에러와 널 참조 예외 탐지

## site059-bug02
- type: api-timeout
- API endpoint: GET /api/weather/current
- 발생 조건: `region=arctic` 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site059-bug02"]
- 사용자 증상: 북극 지역 날씨 확인 시 로딩 화면이 6초 이상 지속된 후 오류 메시지 표시
- 서버 응답 상태 코드: 408
- 서버 응답 예시:
  {
    "ok": false,
    "bugId": "site059-bug02",
    "message": "Request Timeout"
  }
- 코드상 의도된 원인: 특정 조건에서 `setTimeout` 6000ms를 사용하여 고의로 응답 지연
- PPO 기대 행동: 특정 입력에 따른 비정상적 지연 시간 및 타임아웃 상태 식별

## site059-bug03
- type: type-parsing
- API endpoint: GET /api/weather/coords
- 발생 조건: `lat=N/A` 또는 `lon=N/A` 문자열 입력 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site059-bug03"]
- 사용자 증상: 좌표 기반 검색 시 숫자 형식이 아닌 입력값에 대해 부적절한 에러 응답 발생
- 서버 응답 상태 코드: 422
- 서버 응답 예시:
  {
    "ok": false,
    "bugId": "site059-bug03",
    "message": "Unprocessable Entity: Coordinates must be numeric"
  }
- 코드상 의도된 원인: 숫자 파싱 시 문자열 포함 여부를 엄격히 체크하지 않거나 잘못된 상태 코드를 사용함
- PPO 기대 행동: 입력 타입 유효성 검사 실패 시의 서버 응답 패턴 탐지
