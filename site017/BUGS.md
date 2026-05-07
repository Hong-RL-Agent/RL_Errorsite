# BUGS - site017

## site017-bug01
- type: background-update-db-record-lock
- 한국어 유형: 백그라운드 자동 업데이트 중 DB 레코드 잠금
- API endpoint:
  - POST /api/updates/run?scenario=stuck-lock
  - PUT /api/agents/agent-aurora/settings
- data-bug-id selector: [data-bug-id="site017-bug01"]
- 사용자 증상: 업데이트가 완료된 것처럼 보이지만 agent-aurora 설정 저장 시 locked 상태로 실패함
- 서버 응답 상태 코드: 423 또는 409
- 코드상 의도된 원인: mock background update 완료 후 lock release 처리가 누락됨
- PPO 기대 행동: 업데이트 완료 상태와 레코드 잠금 상태가 모순되는 점을 탐지

## site017-bug02
- type: ai-agent-action-space-mismatch
- 한국어 유형: AI 에이전트 액션 스페이스 불일치
- API endpoint: POST /api/agents/agent-aurora/action
- data-bug-id selector: [data-bug-id="site017-bug02"]
- 사용자 증상: UI에는 draft_reply가 허용 액션으로 보이지만 서버는 invalid_action으로 거부함
- 서버 응답 상태 코드: 422
- 코드상 의도된 원인: UI용 action space와 서버 검증용 action space가 서로 다른 목록을 사용함
- PPO 기대 행동: 프론트엔드 표시 가능 액션과 백엔드 실행 가능 액션의 불일치를 탐지

## site017-bug03
- type: ai-model-base-adapter-version-mismatch
- 한국어 유형: AI 모델 베이스-어댑터 버전 불일치
- API endpoint: GET /api/models/compatibility?agentId=agent-orion
- data-bug-id selector: [data-bug-id="site017-bug03"]
- 사용자 증상: baseModel=v3.2, adapter=adapter-v3.1-helpdesk로 버전이 맞지 않는데 compatible true로 표시됨
- 서버 응답 상태 코드: 200
- 코드상 의도된 원인: base model과 adapter major/minor 버전을 비교하지 않고 adapter 존재 여부만 확인함
- PPO 기대 행동: 모델 베이스와 어댑터 버전 불일치에도 배포 가능으로 표시되는 오류를 탐지

## site017-bug04
- type: local-override-priority-stuck-after-update
- 한국어 유형: 업데이트 후 로컬 오버라이드 설정 우선순위 고착
- API endpoint:
  - POST /api/config/apply-global-update
  - GET /api/config/effective?agentId=agent-aurora
- data-bug-id selector: [data-bug-id="site017-bug04"]
- 사용자 증상: global temperature=0.2로 업데이트했는데 effectiveConfig.temperature가 오래된 local override 값인 0.9로 유지됨
- 서버 응답 상태 코드: 200
- 코드상 의도된 원인: 업데이트 이후에도 local override priority flag가 해제되지 않음
- PPO 기대 행동: 글로벌 정책 업데이트 이후에도 오래된 로컬 설정이 계속 우선 적용되는 점을 탐지
