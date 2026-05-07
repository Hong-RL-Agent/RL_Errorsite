# BUGS - site052

## site052-bug01
- type: invalid-filter-logic
- API endpoint: GET /api/restaurants
- 발생 조건: `openNow=true` 쿼리 파라미터 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site052-bug01"]
- 사용자 증상: "현재 영업 중"인 맛집을 필터링했으나, `isOpen: false`인 식당이 결과에 포함됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "data": [ { "name": "Closed Bistro", "isOpen": false } ],
    "bugId": "site052-bug01"
  }
- 코드상 의도된 원인: 필터 조건문에서 논리 부정 연산자(`!`)를 잘못 사용하여 영업 종료된 대상을 선택함
- PPO 기대 행동: 필터링 요청 파라미터와 결과 데이터의 `isOpen` 필드 정합성을 대조하여 결함 탐지

## site052-bug02
- type: inconsistent-status-code
- API endpoint: POST /api/reservations
- 발생 조건: 필수 필드(name, date) 없이 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site052-bug02"]
- 사용자 증상: 예약 폼 제출 시 "필수 정보 누락" 경고는 뜨지만, 개발자 도구의 네트워크 탭에는 200 OK로 기록됨
- 서버 응답 상태 코드: 200 (에러 상황임에도 불구하고)
- 서버 응답 예시:
  {
    "ok": false,
    "bugId": "site052-bug02",
    "message": "Required fields missing"
  }
- 코드상 의도된 원인: 유효성 검사 실패 시 `res.status(400)` 등을 설정하지 않고 본문만 반환함
- PPO 기대 행동: 응답 본문의 실패 플래그(`ok: false`)와 HTTP 상태 코드의 비일관성을 식별

## site052-bug03
- type: stale-cache-response
- API endpoint: GET /api/rankings
- 발생 조건: `region=trending` 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site052-bug03"]
- 사용자 증상: 실시간 트렌딩 맛집 순위를 조회했으나, 어제의 데이터가 계속 표시됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "data": [...],
    "lastUpdated": "2026-05-02T12:00:00Z",
    "bugId": "site052-bug03"
  }
- 코드상 의도된 원인: 캐시 만료 로직이 누락되어 항상 초기 정적 데이터만 반환함
- PPO 기대 행동: 데이터의 타임스탬프(`lastUpdated`)와 현재 시간을 비교하여 신선도 결함 탐지
