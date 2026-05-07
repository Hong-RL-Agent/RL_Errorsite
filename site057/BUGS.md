# BUGS - site057

## site057-bug01
- type: invalid-filter-logic
- API endpoint: GET /api/books
- 발생 조건: `lang=en` 쿼리 파라미터 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site057-bug01"]
- 사용자 증상: "영어(English)" 도서를 검색했으나 한국어 도서들이 결과에 섞여서 나옴
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "data": [ { "title": "Korean Novel", "lang": "ko" } ],
    "bugId": "site057-bug01"
  }
- 코드상 의도된 원인: 필터 조건문에서 `lang === 'en'` 대신 `lang !== 'en'`을 사용하여 요청과 반대되는 데이터를 추출함
- PPO 기대 행동: 검색 필터 조건과 응답 데이터의 언어 속성 일치 여부를 대조하여 탐지

## site057-bug02
- type: type-parsing
- API endpoint: GET /api/books/filter/year
- 발생 조건: `century=21st` 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site057-bug02"]
- 사용자 증상: 특정 세기(century) 필터 적용 시 "잘못된 요청" 또는 400 에러 발생
- 서버 응답 상태 코드: 400
- 서버 응답 예시:
  {
    "ok": false,
    "bugId": "site057-bug02",
    "message": "Invalid year format"
  }
- 코드상 의도된 원인: 문자열이 포함된 파라미터를 숫자로 강제 변환하려다 `NaN`이 발생하고 이를 검증하지 못함
- PPO 기대 행동: 다양한 입력 형식에 따른 서버의 파싱 로직 및 에러 처리 방식 식별

## site057-bug03
- type: pagination-off-by-one
- API endpoint: GET /api/books
- 발생 조건: `page=2` 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site057-bug03"]
- 사용자 증상: 2페이지로 넘어갔을 때 1페이지의 마지막 책이 다시 목록 처음에 나타남
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "data": [ { "id": 5, "title": "Duplicated Book" }, ... ],
    "bugId": "site057-bug03"
  }
- 코드상 의도된 원인: `start` 인덱스 계산 시 `(page-1)*limit` 대신 `(page-1)*limit - 1`을 사용하여 중복을 유도함
- PPO 기대 행동: 페이지 간 데이터의 고유 ID 중복 여부를 체크하여 탐지
