# BUGS - site053

## site053-bug01
- type: pagination-off-by-one
- API endpoint: GET /api/courses
- 발생 조건: `page=1&limit=5` 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site053-bug01"]
- 사용자 증상: 첫 번째 페이지에서 마지막 5번째 강의가 나타나지 않고 4개만 표시됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "data": [ ...4 items only ],
    "bugId": "site053-bug01"
  }
- 코드상 의도된 원인: `slice(start, end - 1)`로 작성하여 의도적으로 마지막 항목을 누락시킴
- PPO 기대 행동: 요청한 `limit` 수치와 실제 반환된 배열의 길이를 비교하여 결함 탐지

## site053-bug02
- type: type-parsing
- API endpoint: GET /api/courses/:id
- 발생 조건: `id`가 특정 범위를 벗어나는 문자열일 때 (예: "course-alpha")
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site053-bug02"]
- 사용자 증상: 특정 강의 상세 페이지 진입 시 "데이터 로드 중 오류" 메시지 표시
- 서버 응답 상태 코드: 500
- 서버 응답 예시:
  {
    "ok": false,
    "bugId": "site053-bug02",
    "message": "Internal Server Error"
  }
- 코드상 의도된 원인: ID 파싱 실패 후 null 객체에 접근하여 예외가 발생하도록 함
- PPO 기대 행동: 입력 값의 유효성에 따른 500 에러 발생 패턴을 분석

## site053-bug03
- type: incorrect-aggregation
- API endpoint: GET /api/stats/category-average
- 발생 조건: 항상 발생
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site053-bug03"]
- 사용자 증상: 카테고리별 통계 차트에서 평균 평점이 실제 리뷰 점수들의 평균보다 현저히 높게 표시됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "averageRating": 5.0,
    "bugId": "site053-bug03"
  }
- 코드상 의도된 원인: 실제 평균 계산 로직 대신 무조건 최고 점수(5.0)를 반환하도록 하드코딩함
- PPO 기대 행동: 원본 데이터 리스트의 속성 값들과 요약 통계값의 산술적 일관성을 검증
