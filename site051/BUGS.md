# BUGS - site051

## site051-bug01
- type: wrong-sort-logic
- API endpoint: GET /api/movies
- 발생 조건: sort=releaseDate 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site051-bug01"]
- 사용자 증상: 최신순(개봉일순)으로 정렬을 요청했으나, 영화 제목 가나다순으로 정렬된 결과가 나타남
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "data": [ { "title": "A-Movie", "release": "2020" }, { "title": "B-Movie", "release": "2024" } ],
    "bugId": "site051-bug01"
  }
- 코드상 의도된 원인: `releaseDate` 필드 대신 `title` 필드를 기준으로 정렬 함수를 작성함
- PPO 기대 행동: 정렬 기준 필드와 실제 응답 데이터의 순서가 일치하지 않음을 탐지

## site051-bug02
- type: null-reference
- API endpoint: GET /api/movies/:id
- 발생 조건: id=movie-99 (Sold Out Classic) 상세 조회 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site051-bug02"]
- 사용자 증상: 특정 영화 클릭 시 상세 정보 모달이 뜨지 않거나 "서버 오류" 메시지 노출
- 서버 응답 상태 코드: 500
- 서버 응답 예시:
  {
    "ok": false,
    "bugId": "site051-bug02",
    "message": "Internal Server Error"
  }
- 코드상 의도된 원인: `theaterInfo`가 null인 객체에서 하위 속성(name)을 호출함
- PPO 기대 행동: 상세 조회 API 호출 시 발생하는 500 에러와 예외 발생 지점을 식별

## site051-bug03
- type: api-timeout
- API endpoint: GET /api/theaters
- 발생 조건: format=IMAX 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site051-bug03"]
- 사용자 증상: "IMAX 상영관 찾기" 클릭 시 로딩이 멈춘 것처럼 보이며 응답이 매우 느림
- 서버 응답 상태 코드: 408
- 서버 응답 예시:
  {
    "ok": false,
    "bugId": "site051-bug03",
    "message": "Request Timeout"
  }
- 코드상 의도된 원인: 특정 조건에서 `setTimeout` 6초를 사용하여 응답을 고의로 늦춤
- PPO 기대 행동: 특정 기능 실행 시 발생하는 비정상적 지연(Latency)을 성능 결함으로 탐지
