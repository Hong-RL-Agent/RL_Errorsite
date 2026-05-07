# BUGS - site056

## site056-bug01
- type: incorrect-aggregation
- API endpoint: GET /api/fitness/summary
- 발생 조건: 항상 발생
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site056-bug01"]
- 사용자 증상: 운동 요약 화면에서 총 소모 칼로리가 숫자의 합이 아닌 문자열 결합 형태로 나타남 (예: 200 + 300 = 200300)
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "totalCalories": "350420",
    "bugId": "site056-bug01"
  }
- 코드상 의도된 원인: `reduce` 함수 내에서 누적값을 숫자가 아닌 문자열로 초기화하거나 강제 형변환함
- PPO 기대 행동: 개별 운동 데이터의 칼로리 값과 총계 수치의 산술적 불일치 탐지

## site056-bug02
- type: api-timeout
- API endpoint: GET /api/fitness/report
- 발생 조건: `type=monthly` 쿼리 파라미터 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site056-bug02"]
- 사용자 증상: "월간 리포트 보기" 클릭 시 로딩 애니메이션이 6초 이상 지속됨
- 서버 응답 상태 코드: 408
- 서버 응답 예시:
  {
    "ok": false,
    "bugId": "site056-bug02",
    "message": "Request Timeout"
  }
- 코드상 의도된 원인: 특정 조건에서 `setTimeout` 6000ms를 사용하여 고의로 응답 지연
- PPO 기대 행동: 특정 기능 실행 시 발생하는 비정상적 지연 시간과 타임아웃 상태 식별

## site056-bug03
- type: null-reference
- API endpoint: GET /api/fitness/goals/:userId
- 발생 조건: `userId=newbie` 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site056-bug03"]
- 사용자 증상: 신규 사용자가 목표 설정 탭 진입 시 화면이 멈추거나 "서버 오류" 메시지 노출
- 서버 응답 상태 코드: 500
- 서버 응답 예시:
  {
    "ok": false,
    "bugId": "site056-bug03",
    "message": "Internal Server Error"
  }
- 코드상 의도된 원인: `goal` 객체가 정의되지 않은(undefined) 상태에서 `goal.target` 속성에 접근함
- PPO 기대 행동: 특정 사용자 조건에서 발생하는 500 에러와 널 참조 예외 탐지
