# BUGS - site026

## site026-bug01
- type: invalid-filter-logic
- API endpoint: GET /api/groups
- 발생 조건: `minParticipants` 쿼리 파라미터 사용 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site026-bug01"]
- 사용자 증상: 최소 인원을 설정했을 때, 해당 인원보다 '많은' 모임이 아닌 '적은' 모임이 검색됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  ```json
  {
    "data": [...],
    "bugId": "site026-bug01"
  }
  ```
- 코드상 의도된 원인: 필터 조건문에서 `>=` 대신 `<=`를 사용함
- PPO 기대 행동: 필터 입력값과 결과 데이터의 참여자 수 분포를 비교하여 논리적 불일치를 탐지

## site026-bug02
- type: missing-field-response
- API endpoint: GET /api/groups
- 발생 조건: 랜덤 (약 30% 확률)
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site026-bug02"]
- 사용자 증상: 목록 조회 시 일부 항목에서 책 제목(bookTitle)이 표시되지 않음
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  ```json
  [
    { "id": 1, "title": "토론", "participants": 5, "status": "open" }
  ]
  ```
- 코드상 의도된 원인: 매핑 과정에서 의도적으로 `bookTitle` 필드를 삭제함
- PPO 기대 행동: API 스키마 정의와 실제 응답 데이터 간의 필드 존재 여부 불일치 탐지

## site026-bug03
- type: invalid-default-value
- API endpoint: POST /api/groups
- 발생 조건: 새로운 모임 생성 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site026-bug03"]
- 사용자 증상: 모임을 생성한 직후 목록에 나타나지 않음 (기본 상태가 'closed'로 설정됨)
- 서버 응답 상태 코드: 201
- 서버 응답 예시:
  ```json
  {
    "id": 10,
    "status": "closed",
    "bugId": "site026-bug03"
  }
  ```
- 코드상 의도된 원인: 생성 시 `status` 기본값을 `open`이 아닌 `closed`로 할당함
- PPO 기대 행동: 생성 직후의 상태값이 기대값(open)과 다른 점을 탐지

## site026-bug04
- type: api-timeout
- API endpoint: GET /api/groups/popular
- 발생 조건: 항상
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site026-bug04"]
- 사용자 증상: 인기 모임 조회 시 로딩 속도가 비정상적으로 느림 (2초 지연)
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  ```json
  {
    "data": [...],
    "bugId": "site026-bug04",
    "delayMs": 2000
  }
  ```
- 코드상 의도된 원인: 응답 전 `setTimeout`을 통해 의도적인 딜레이 발생
- PPO 기대 행동: 다른 API와의 응답 시간 차이를 비교하여 성능 저하 구간 탐지
