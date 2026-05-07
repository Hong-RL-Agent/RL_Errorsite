# AI Ops Console - site017

기업 내부에서 사용하는 AI 에이전트 운영 및 모델 업데이트 관리 대시보드입니다. 이 사이트는 PPO(Proximal Policy Optimization) 에이전트가 백엔드 로직 오류를 탐지하도록 학습시키기 위한 테스트 환경입니다.

## 프로젝트 정보
- **사이트 ID**: site017
- **포트 번호**: 9126
- **기술 스택**: React + Vite + Express

## 실행 방법
```bash
cd site017
npm install
npm start
```
브라우저에서 `http://localhost:9126`으로 접속하십시오.

## API 엔드포인트 목록
- `GET /api/health`: 시스템 상태 확인
- `GET /api/agents`: 에이전트 목록 조회
- `GET /api/agents/:agentId`: 에이전트 상세 정보 및 로그 조회
- `PUT /api/agents/:agentId/settings`: 에이전트 설정 저장 (Bug 01 발생 가능)
- `POST /api/updates/run`: 백그라운드 업데이트 시뮬레이션 (Bug 01 트리거)
- `GET /api/actions/space`: UI용 액션 스페이스 조회
- `POST /api/agents/:agentId/action`: 에이전트 액션 실행 (Bug 02 발생 가능)
- `GET /api/models/compatibility`: 모델 베이스-어댑터 호환성 검사 (Bug 03 발생 가능)
- `POST /api/config/apply-global-update`: 글로벌 설정 업데이트 적용
- `GET /api/config/effective`: 에이전트별 최종 적용 설정 반환 (Bug 04 발생 가능)

## 정상 작동 기능
- 에이전트 함대(Fleet) 목록 실시간 조회 및 상태 필터링
- 에이전트 상세 정보 및 작업 로그 확인
- 시스템 헬스체크 및 실시간 콘솔 로그 스트리밍
- 백그라운드 업데이트 작업 관리 및 시뮬레이션
- 글로벌 정책 관리 및 로컬 오버라이드 설정

## 의도된 백엔드 오류 (4개)

### 1. site017-bug01
- **유형**: background-update-db-record-lock (백그라운드 자동 업데이트 중 DB 레코드 잠금)
- **트리거**: "Updates & Models" 탭에서 "Simulate Locked Update" 버튼 클릭 후, 에이전트 관리 모달에서 "Save New Settings" 시도.
- **증상**: 업데이트가 완료되었음에도 agent-aurora 레코드가 locked 상태로 유지되어 설정 저장이 실패(423)함.
- **data-bug-id**: `site017-bug01`

### 2. site017-bug02
- **유형**: ai-agent-action-space-mismatch (AI 에이전트 액션 스페이스 불일치)
- **트리거**: "Action Space" 탭에서 "draft_reply" 액션의 "Execute" 버튼 클릭.
- **증상**: UI에서는 허용된 액션으로 표시되지만, 서버 검증 로직에서는 누락되어 있어 422 Invalid Action 에러가 발생함.
- **data-bug-id**: `site017-bug02`

### 3. site017-bug03
- **유형**: ai-model-base-adapter-version-mismatch (AI 모델 베이스-어댑터 버전 불일치)
- **트리거**: "Updates & Models" 탭에서 "Run Compatibility Check" 버튼 클릭.
- **증상**: baseModel(v3.2)과 adapter(v3.1)의 버전이 맞지 않음에도 불구하고 서버가 `compatible: true`를 반환함.
- **data-bug-id**: `site017-bug03`

### 4. site017-bug04
- **유형**: local-override-priority-stuck-after-update (업데이트 후 로컬 오버라이드 설정 우선순위 고착)
- **트리거**: "Policy Overrides" 탭에서 "Deploy Global Policy Update" 클릭 후 "Check Aurora" 클릭.
- **증상**: 글로벌 업데이트로 temperature가 0.2로 설정되었음에도 불구하고, 오래된 로컬 오버라이드 값(0.9)이 계속 우선 적용됨.
- **data-bug-id**: `site017-bug04`

## PPO 에이전트 탐지 가이드
- **상태 모순 탐지**: 업데이트가 완료된 상태와 리소스가 잠겨있는 상태의 논리적 모순을 찾아내야 합니다 (Bug 01).
- **인터페이스 불일치 탐지**: 클라이언트가 가진 API 명세(UI)와 실제 서버의 유효성 검사 규칙 간의 간극을 탐지해야 합니다 (Bug 02).
- **데이터 무결성 검증**: 명시된 데이터(v3.2 vs v3.1)와 판단 결과(Compatible) 사이의 논리적 오류를 식별해야 합니다 (Bug 03).
- **정책 우선순위 위반 탐지**: 업데이트 이후 보장되어야 하는 정책 전파(Global Policy)가 특정 조건에서 무시되는 현상을 탐지해야 합니다 (Bug 04).

## 기타
- `BUGS.md`: 상세한 버그 명세서
- `TODO.md`: 개발 및 검증 체크리스트
