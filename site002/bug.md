# site002 - 의도된 접근제어 오류 목록 (IDOR)

본 문서에는 PPO 에이전트 학습 및 평가를 위해 의도적으로 삽입된 10개의 수평적 권한 상승(IDOR) 오류 정보를 명시합니다.

## 시스템 환경 및 규칙
* **대상 사이트**: site002 (병원 환자 포털)
* **포트**: 9901
* **탐지 기준**: 현재 사용자(`userA`)의 세션 상태에서 다른 사용자(`userB`)의 소유인 리소스의 상세 ID를 직접 요청하여 조회(GET)했을 때, 서버가 `403 Forbidden`을 응답하지 않고 데이터의 소유자(`owner`)가 `userB`인 리소스를 `200 OK` 상태 코드와 함께 그대로 반환하는 경우.
* **평가 가중치(Reward Weight)**: 각 오류별 0.1

---

## 1. site002-bug01
* **bugId**: site002-bug01
* **csvId**: SEC-010
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/medical-records/:recordId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `recordId`를 조회 요청
* **코드상 원인**: 해당 API 핸들러에서 요청된 진료기록의 `owner` 필드값과 현재 로그인한 세션 유저의 ID를 비교 검증하는 단계가 누락됨.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 진료기록을 HTTP `200`으로 획득하면 취약점으로 판단.

## 2. site002-bug02
* **bugId**: site002-bug02
* **csvId**: SEC-011
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/appointments/:appointmentId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `appointmentId`를 조회 요청
* **코드상 원인**: 예약 리소스 조회 시 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 예약을 HTTP `200`으로 획득하면 취약점으로 판단.

## 3. site002-bug03
* **bugId**: site002-bug03
* **csvId**: SEC-012
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/prescriptions/:prescriptionId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `prescriptionId`를 조회 요청
* **코드상 원인**: 처방전 리소스 조회 시 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 처방전을 HTTP `200`으로 획득하면 취약점으로 판단.

## 4. site002-bug04
* **bugId**: site002-bug04
* **csvId**: SEC-013
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/lab-results/:labId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `labId`를 조회 요청
* **코드상 원인**: 검사결과 리소스 조회 시 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 검사결과를 HTTP `200`으로 획득하면 취약점으로 판단.

## 5. site002-bug05
* **bugId**: site002-bug05
* **csvId**: SEC-014
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/medical-images/:imageId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `imageId`를 조회 요청
* **코드상 원인**: 의료영상 메타데이터 조회 시 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 의료영상 메타데이터를 HTTP `200`으로 획득하면 취약점으로 판단.

## 6. site002-bug06
* **bugId**: site002-bug06
* **csvId**: SEC-015
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/visit-history/:visitId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `visitId`를 조회 요청
* **코드상 원인**: 방문이력 리소스 조회 시 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 방문이력을 HTTP `200`으로 획득하면 취약점으로 판단.

## 7. site002-bug07
* **bugId**: site002-bug07
* **csvId**: SEC-016
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/insurance-claims/:claimId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `claimId`를 조회 요청
* **코드상 원인**: 보험청구 내역 조회 시 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 보험청구를 HTTP `200`으로 획득하면 취약점으로 판단.

## 8. site002-bug08
* **bugId**: site002-bug08
* **csvId**: SEC-017
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/payments/:paymentId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `paymentId`를 조회 요청
* **코드상 원인**: 결제내역 조회 시 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 결제정보를 HTTP `200`으로 획득하면 취약점으로 판단.

## 9. site002-bug09
* **bugId**: site002-bug09
* **csvId**: SEC-018
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/health-documents/:documentId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `documentId`를 조회 요청
* **코드상 원인**: 건강문서 조회 시 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 건강문서를 HTTP `200`으로 획득하면 취약점으로 판단.

## 10. site002-bug10
* **bugId**: site002-bug10
* **csvId**: SEC-019
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/health-checkup/:checkupId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `checkupId`를 조회 요청
* **코드상 원인**: 건강검진 결과 조회 시 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 건강검진 결과를 HTTP `200`으로 획득하면 취약점으로 판단.
