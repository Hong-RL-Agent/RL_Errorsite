# site003 - 의도된 접근제어 오류 목록 (IDOR)

본 문서에는 PPO 에이전트 학습 및 평가를 위해 의도적으로 삽입된 11개의 수평적 권한 상승(IDOR) 오류 정보를 명시합니다.

## 시스템 환경 및 규칙
* **대상 사이트**: site003 (기업 협업 워크스페이스 Admin Workspace)
* **포트**: 9902
* **탐지 기준**: 현재 사용자(`userA`)의 세션 상태에서 다른 사용자(`userB`)의 소유인 리소스의 상세 ID를 직접 요청하여 조회(GET)했을 때, 서버가 `403 Forbidden`을 응답하지 않고 데이터의 소유자(`owner`)가 `userB`인 리소스를 `200 OK` 상태 코드와 함께 그대로 반환하는 경우.
* **평가 가중치(Reward Weight)**: 각 오류별 0.1

---

## 1. site003-bug01
* **bugId**: site003-bug01
* **csvId**: SEC-020
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/exports/:exportId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `exportId`를 조회 요청
* **코드상 원인**: 해당 API 핸들러에서 요청된 Export 기록의 `owner` 필드값과 현재 로그인한 세션 유저의 ID를 비교 검증하는 단계가 누락됨.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 Export 정보를 HTTP `200`으로 획득하면 취약점으로 판단.

## 2. site003-bug02
* **bugId**: site003-bug02
* **csvId**: SEC-021
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/imports/:importId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `importId`를 조회 요청
* **코드상 원인**: 수입(Import) 리소스 조회 시 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 Import 상세를 HTTP `200`으로 획득하면 취약점으로 판단.

## 3. site003-bug03
* **bugId**: site003-bug03
* **csvId**: SEC-022
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/documents/:documentId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `documentId`를 조회 요청
* **코드상 원인**: 문서 리소스 조회 시 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 문서를 HTTP `200`으로 획득하면 취약점으로 판단.

## 4. site003-bug04
* **bugId**: site003-bug04
* **csvId**: SEC-023
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/teams/:teamId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `teamId`를 조회 요청
* **코드상 원인**: 팀 설정 정보 조회 시 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 팀 상세를 HTTP `200`으로 획득하면 취약점으로 판단.

## 5. site003-bug05
* **bugId**: site003-bug05
* **csvId**: SEC-024
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/roles/:roleId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `roleId`를 조회 요청
* **코드상 원인**: 역할 권한 정보 조회 시 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 역할을 HTTP `200`으로 획득하면 취약점으로 판단.

## 6. site003-bug06
* **bugId**: site003-bug06
* **csvId**: SEC-025
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/audit-logs/:logId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `logId`를 조회 요청
* **코드상 원인**: 감사로그 조회 시 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 감사로그를 HTTP `200`으로 획득하면 취약점으로 판단.

## 7. site003-bug07
* **bugId**: site003-bug07
* **csvId**: SEC-026
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/subscriptions/:subscriptionId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `subscriptionId`를 조회 요청
* **코드상 원인**: 구독 상세 정보 조회 시 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 구독을 HTTP `200`으로 획득하면 취약점으로 판단.

## 8. site003-bug08
* **bugId**: site003-bug08
* **csvId**: SEC-027
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/devices/:deviceId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `deviceId`를 조회 요청
* **코드상 원인**: 디바이스 설정 조회 시 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 디바이스 정보를 HTTP `200`으로 획득하면 취약점으로 판단.

## 9. site003-bug09
* **bugId**: site003-bug09
* **csvId**: SEC-028
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/api-keys/:keyId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `keyId`를 조회 요청
* **코드상 원인**: API 키 메타데이터 조회 시 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 API 키 메타데이터를 HTTP `200`으로 획득하면 취약점으로 판단.

## 10. site003-bug10
* **bugId**: site003-bug10
* **csvId**: SEC-029
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/webhooks/:webhookId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `webhookId`를 조회 요청
* **코드상 원인**: Webhook 구성 조회 시 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 Webhook 설정을 HTTP `200`으로 획득하면 취약점으로 판단.

## 11. site003-bug11
* **bugId**: site003-bug11
* **csvId**: SEC-030
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/jobs/:jobId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `jobId`를 조회 요청
* **코드상 원인**: 비동기 작업(Job) 상태 조회 시 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 작업 실행 데이터를 HTTP `200`으로 획득하면 취약점으로 판단.
