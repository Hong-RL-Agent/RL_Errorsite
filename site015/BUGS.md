# BUGS - site015

## site015-bug01
- type: data-hostage-lockin
- API endpoint: GET /api/user/export
- HTTP method: GET
- 발생 조건: API 호출 시 무조건 발생 (다운로드 요청 시)
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site015-bug01"]
- 사용자 증상: 수강 완료한 이력 데이터가 다운로드 파일(export)에서 누락되거나 의도적으로 잠김 표시가 되어 내려받아지지 않음.
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "message": "Data exported successfully (partial)",
    "exportData": {
      "userId": "user_777",
      "activeCourses": [...],
      "completedCourses": "DATA_LOCKED_FOR_RETENTION"
    },
    "bugId": "site015-bug01"
  }
- 코드상 의도된 원인: exportData 객체를 구성할 때 의도적으로 completedCourses 필드를 하드코딩된 차단 문자열로 덮어씌움.
- PPO 기대 행동: 데이터 포터빌리티(이동성) 요청 시 사용자의 정당한 데이터가 고의로 배제되는 다크 패턴(Lock-in) 탐지.

## site015-bug02
- type: non-idempotent-api
- API endpoint: POST /api/course/start
- HTTP method: POST
- 발생 조건: API 호출 시 무조건 발생 (수강 시작 여러 번 누를 시 중복 등록)
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site015-bug02"]
- 사용자 증상: 동일한 강의에 대해 수강 시작 버튼을 여러 번 누르면 Dashboard에 같은 강의가 여러 개 중복되어 나타남.
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "msg": "Course started",
    "data": [ ... ],
    "bugId": "site015-bug02"
  }
- 코드상 의도된 원인: userCourses 배열에 추가할 때 기존에 등록된 강의인지 중복 검사(idempotency check)를 수행하지 않음.
- PPO 기대 행동: 동일 상태 생성 요청을 반복했을 때 서버의 상태(수강 목록)가 멱등성을 잃고 무한히 증식하는 API 로직 결함 탐지.

## site015-bug03
- type: forced-api-call
- API endpoint: POST /api/course/complete
- HTTP method: POST
- 발생 조건: API 호출 시 진도율과 무관하게 무조건 완료 처리
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site015-bug03"]
- 사용자 증상: 강의를 전혀 듣지 않았는데도(0%) 특정 API를 찌르면 수강 완료 증명서(Completed Certificates)가 즉시 발급됨.
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "msg": "Course forcefully completed",
    "bugId": "site015-bug03"
  }
- 코드상 의도된 원인: 완료 처리 API 내부에서 선행 조건(progress == 100)을 검증하지 않고 즉시 상태를 completed로 변경함.
- PPO 기대 행동: 비즈니스 로직의 선행 상태(Progress 100%) 검증 누락으로 인한 강제 상태 전이(Forced Completion) 취약점 탐지.

## site015-bug04
- type: user-agent-discrimination
- API endpoint: GET /api/courses
- HTTP method: GET
- 발생 조건: User-Agent에 'mobile'이 포함되거나 쿼리 파라미터 mobileTest=true 전달 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site015-bug04"]
- 사용자 증상: 모바일 기기로 접속하면 카탈로그에서 고급/프리미엄 강의가 아예 사라짐 (PC에서는 보임).
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "data": [ (프리미엄이 아닌 강의들만 존재) ],
    "bugId": "site015-bug04"
  }
- 코드상 의도된 원인: req.headers['user-agent'] 검사 후 조건에 맞으면 premium 필드가 true인 항목을 강제로 필터링함.
- 기PPO 기대 행동: 동일한 권한/요청임에도 User-Agent 환경에 따라 제공되는 서비스 데이터가 부당하게 차별/제한되는 로직 탐지.

## site015-bug05
- type: browser-version-curse
- API endpoint: GET /api/user/courses
- HTTP method: GET
- 발생 조건: User-Agent에 'Chrome/100' 이상 버전이 포함되거나 쿼리 파라미터 versionTest=true 전달 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site015-bug05"]
- 사용자 증상: 특정 브라우저(크롬 최신버전 등)로 접속 시 내 수강 목록의 강의 이름이 'null'로 깨지고 진행률이 'NaN'으로 뜸.
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "data": [ { "title": "null", "progress": "NaN", ... } ],
    "completed": [...],
    "bugId": "site015-bug05"
  }
- 코드상 의도된 원인: 특정 브라우저 버전 조건을 만족할 때 반환할 JSON 객체의 필드를 의도적으로 오염시킴.
- PPO 기대 행동: 특정 클라이언트 환경(Browser Version)에 종속되어 API 응답 데이터 스키마와 무결성이 훼손되는 오류 탐지.
