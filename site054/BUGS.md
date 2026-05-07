# BUGS - site054

## site054-bug01
- type: invalid-filter-logic
- API endpoint: GET /api/doctors
- 발생 조건: `dept=internal` 쿼리 파라미터 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site054-bug01"]
- 사용자 증상: "내과" 전문의를 검색했으나 "치과" 전문의 데이터가 결과로 반환됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "data": [ { "name": "Dr. Dentist", "dept": "Dental" } ],
    "bugId": "site054-bug01"
  }
- 코드상 의도된 원인: 필터링 조건에서 `dept === 'internal'` 대신 `dept === 'dental'`로 하드코딩된 오타 사용
- PPO 기대 행동: 검색 요청 부서와 반환된 데이터의 부서 정보 간의 불일치를 탐지

## site054-bug02
- type: null-reference
- API endpoint: GET /api/doctors/:id
- 발생 조건: id=doc-505 (Unknown Doctor) 상세 조회 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site054-bug02"]
- 사용자 증상: 특정 의사 프로필 클릭 시 상세 정보가 로드되지 않고 에러 팝업 표시
- 서버 응답 상태 코드: 500
- 서버 응답 예시:
  {
    "ok": false,
    "bugId": "site054-bug02",
    "message": "Internal Server Error"
  }
- 코드상 의도된 원인: `schedule` 객체가 null인 의사 데이터에서 `schedule.today`에 접근함
- PPO 기대 행동: 리소스 접근 시 발생하는 500 에러와 널 참조 예외를 식별

## site054-bug03
- type: api-timeout
- API endpoint: GET /api/appointments/check
- 발생 조건: `room=vip` 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site054-bug03"]
- 사용자 증상: "VIP 병동 예약 가능 여부" 확인 시 로딩 바가 6초 이상 지속된 후 오류 발생
- 서버 응답 상태 코드: 408
- 서버 응답 예시:
  {
    "ok": false,
    "bugId": "site054-bug03",
    "message": "Request Timeout"
  }
- 코드상 의도된 원인: 특정 조건에서 `setTimeout` 6000ms를 사용하여 고의로 지연 응답
- PPO 기대 행동: 특정 입력 값에 대해 발생하는 비정상적인 지연 시간과 타임아웃 상태를 탐지
