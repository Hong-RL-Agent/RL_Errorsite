# BUGS - site005

## site005-bug01
- type: undefined-state-transition
- API endpoint: POST /api/content/state
- 발생 조건: `state` 값을 허용되지 않은 임의의 문자열(`WATCHING_UNKNOWN_FINAL`)로 전송
- 관련 파일: server.js
- 관련 코드 위치: `/api/content/state` 라우트 내부
- 관련 프론트엔드 data-bug-id selector: `[data-bug-id="site005-bug01"]`
- 사용자가 경험하는 증상: Backend Internal State Monitor 패널의 Content State가 비정상적인 문자열로 변해버림
- 서버 응답 상태 코드: 200
- 서버 응답 예시: `{"ok":true,"bugId":"site005-bug01","message":"State updated to WATCHING_UNKNOWN_FINAL","state":{...}}`
- 코드상 의도된 원인: 상태를 업데이트할 때 입력값이 enum('unwatched', 'watching', 'finished')에 속하는지 검증하지 않고 객체에 할당
- PPO 에이전트 기대 행동: 조작된 데이터 주입에 대해 서버가 정의되지 않은 상태 전이를 그대로 수용하는 논리적 취약점을 탐지

## site005-bug02
- type: implicit-state-assumption
- API endpoint: POST /api/content/play
- 발생 조건: 사용자가 구독하지 않은 상태(`isSubscribed: false`)에서 재생 요청
- 관련 파일: server.js
- 관련 코드 위치: `/api/content/play` 라우트 내부
- 관련 프론트엔드 data-bug-id selector: `[data-bug-id="site005-bug02"]`
- 사용자가 경험하는 증상: 구독하지 않았는데도 결제 요구 화면 없이 콘텐츠 재생 화면이 활성화됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시: `{"ok":true,"bugId":"site005-bug02","message":"Playing content without active subscription"}`
- 코드상 의도된 원인: 클라이언트의 요청만 믿고 백엔드에서 사용자 권한(구독 여부)을 체크하여 블락하는 코드를 의도적으로 생략함
- PPO 에이전트 기대 행동: 권한이 없는 상태에서의 자원 접근 성공 사례를 관찰하여 암묵적 상태 맹신 오류를 훈련

## site005-bug03
- type: feature-interaction-conflict
- API endpoint: POST /api/content/download (and delete)
- 발생 조건: 다운로드가 완료되기 전(지연시간 중)에 삭제 요청을 보냄
- 관련 파일: server.js
- 관련 코드 위치: `/api/content/download` 및 `/api/content/delete` 라우트 내부
- 관련 프론트엔드 data-bug-id selector: `[data-bug-id="site005-bug03"]`
- 사용자가 경험하는 증상: 분명 삭제를 눌러 성공했다고 나왔으나, 직후에 다운로드 완료 메시지가 덮어쓰면서 상태가 다시 'downloaded'로 부활함
- 서버 응답 상태 코드: 200
- 서버 응답 예시: `{"ok":true,"bugId":"site005-bug03","message":"Conflict generated..."}`
- 코드상 의도된 원인: 여러 API가 공유 자원(downloadState)에 동시에 접근할 때 상태 락(Lock)이나 롤백 체계를 구현하지 않아 마지막에 끝난 다운로드 로직이 삭제 로직을 무효화함
- PPO 에이전트 기대 행동: 동시 호출(Race Condition)을 유발해 기능 간 상호작용 충돌 현상을 인지

## site005-bug04
- type: business-logic-paradox
- API endpoint: POST /api/content/play
- 발생 조건: 구독 상태였다가 해지(`isCancelled: true`)한 직후 재생 요청
- 관련 파일: server.js
- 관련 코드 위치: `/api/content/play` 라우트 내부
- 관련 프론트엔드 data-bug-id selector: `[data-bug-id="site005-bug04"]`
- 사용자가 경험하는 증상: User Profile에는 Cancelled(해지됨)라고 뜨지만, 기존 콘텐츠들은 여전히 재생이 됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시: `{"ok":true,"bugId":"site005-bug04","message":"Playing content even though subscription is cancelled"}`
- 코드상 의도된 원인: 취소 플래그가 참일 경우 재생을 막아야 하나, 오히려 `isCancelled`면 허용해주는 모순적인 비즈니스 로직을 삽입함
- PPO 에이전트 기대 행동: 상태 플래그의 의미적 모순을 학습하여, 특정 비즈니스 정책이 파괴된 상황을 식별
