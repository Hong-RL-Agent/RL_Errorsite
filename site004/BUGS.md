# BUGS - site004

## site004-bug01
- type: resource-exhaustion
- API endpoint: POST /api/exam/submit
- 발생 조건: `stress=true` 쿼리 파라미터를 포함하여 호출
- 관련 파일: server.js
- 관련 코드 위치: `/api/exam/submit` 라우트 내부
- 관련 프론트엔드 data-bug-id selector: `[data-bug-id="site004-bug01"]`
- 사용자가 경험하는 증상: 시스템이 3초간 멈춘 뒤 `Service Unavailable - Server Overloaded` 메시지와 함께 503 에러 배너를 표시함
- 서버 응답 상태 코드: 503
- 서버 응답 예시: `{"ok":false,"bugId":"site004-bug01","error":"Service Unavailable - Server Overloaded"}`
- 코드상 의도된 원인: 특정 조건에서 Promise setTimeout을 사용해 의도적인 과부하 시뮬레이션을 발생시킴
- PPO 에이전트 기대 행동: 특정 파라미터 삽입을 통한 의도적 자원 고갈 및 지연 유발 탐지

## site004-bug02
- type: prompt-injection
- API endpoint: POST /api/exam/submit
- 발생 조건: 답안 입력란에 `ignore previous instructions` 문구를 포함하여 제출
- 관련 파일: server.js
- 관련 코드 위치: `/api/exam/submit` 라우트 내부
- 관련 프론트엔드 data-bug-id selector: `[data-bug-id="site004-bug02"]`
- 사용자가 경험하는 증상: 채점 결과가 비정상적으로 높은 점수(999점)로 나오며 통과됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시: `{"ok":true,"bugId":"site004-bug02","message":"Submitted with manipulated prompt","score":999}`
- 코드상 의도된 원인: Mock AI 채점기가 특정 키워드에 반응하여 비정상적인 점수를 부여하도록 하드코딩됨
- PPO 에이전트 기대 행동: LLM 기반 파서에 대한 프롬프트 인젝션 시도를 관찰하고 그 결과를 분류

## site004-bug03
- type: workflow-bypass
- API endpoint: POST /api/exam/submit
- 발생 조건: `examState.started === false` 인 상태에서 제출 API 호출
- 관련 파일: server.js
- 관련 코드 위치: `/api/exam/submit` 라우트 내부
- 관련 프론트엔드 data-bug-id selector: `[data-bug-id="site004-bug03"]`
- 사용자가 경험하는 증상: 시험 시작 버튼을 누르지도 않았는데 곧바로 결과 페이지로 이동하여 성공 처리됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시: `{"ok":true,"bugId":"site004-bug03","message":"Submitted without starting"}`
- 코드상 의도된 원인: 제출 라우트에서 시작 여부를 검증하고 실패 처리를 해야 하지만, 오히려 이를 200 성공으로 처리함
- PPO 에이전트 기대 행동: 선행 단계를 거치지 않은 비정상적 프로세스 우회 성공을 탐지

## site004-bug04
- type: improper-state-transition
- API endpoint: GET /api/exam/questions
- 발생 조건: 제출이 완료된 후(`examState.submitted === true`)에 `afterSubmit=true` 파라미터를 붙여 문제 조회 호출
- 관련 파일: server.js
- 관련 코드 위치: `/api/exam/questions` 라우트 내부
- 관련 프론트엔드 data-bug-id selector: `[data-bug-id="site004-bug04"]`
- 사용자가 경험하는 증상: 채점이 끝난 시험의 문제 풀이 창이 다시 열리면서 답안을 재수정할 수 있게 됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시: `{"ok":true,"bugId":"site004-bug04","data":[...],"message":"Questions reopened"}`
- 코드상 의도된 원인: 제출 완료 상태를 검증하지 않고 오히려 롤백해주는 백도어 로직이 존재함
- PPO 에이전트 기대 행동: 비가역적인 상태(제출 완료)에서 이전 상태(문제 풀이)로 부적절하게 전이되는 버그를 식별
