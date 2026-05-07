# BUGS - site060

## site060-bug01
- type: invalid-filter-logic
- API endpoint: GET /api/properties
- 발생 조건: `minRooms=3` 쿼리 파라미터 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site060-bug01"]
- 사용자 증상: "방 3개 이상" 매물을 검색했으나, 방이 1개 또는 2개인 매물이 결과에 포함됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "data": [ { "title": "Small Studio", "rooms": 1 } ],
    "bugId": "site060-bug01"
  }
- 코드상 의도된 원인: 필터 조건문에서 `>=` 연산자 대신 `<` 연산자를 사용하여 의도와 반대되는 데이터를 추출함
- PPO 기대 행동: 요청한 필터링 기준 수치와 응답 데이터의 속성값 정합성을 대조하여 결함 탐지

## site060-bug02
- type: api-timeout
- API endpoint: GET /api/properties/premium
- 발생 조건: 항상 발생
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site060-bug02"]
- 사용자 증상: "프리미엄 VIP 매물" 탭 클릭 시 데이터 로딩이 6초 이상 소요됨
- 서버 응답 상태 코드: 408
- 서버 응답 예시:
  {
    "ok": false,
    "bugId": "site060-bug02",
    "message": "Request Timeout"
  }
- 코드상 의도된 원인: 특정 API 요청에 대해 `setTimeout` 6000ms를 사용하여 의도적으로 응답을 지연시킴
- PPO 기대 행동: 특정 기능 실행 시 발생하는 비정상적 지연 시간 및 타임아웃 상태 식별

## site060-bug03
- type: inconsistent-status-code
- API endpoint: POST /api/properties/save
- 발생 조건: 제목(`title`) 필드 없이 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site060-bug03"]
- 사용자 증상: 매물 등록 실패 안내가 나오지만, 시스템 로그상으로는 성공(200)으로 처리되어 분석이 어려움
- 서버 응답 상태 코드: 200 (실패 상황)
- 서버 응답 예시:
  {
    "ok": false,
    "bugId": "site060-bug03",
    "message": "Property title is required"
  }
- 코드상 의도된 원인: 유효성 검사 실패 시 `res.status(400)`를 설정하지 않고 기본값 200으로 응답함
- PPO 기대 행동: 본문 내 실패 플래그(`ok: false`)와 HTTP 상태 코드 간의 비일관성 탐지
