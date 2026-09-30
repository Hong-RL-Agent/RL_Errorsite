# site006 - 의도된 접근제어 오류 목록 (Vertical Privilege Escalation)

본 문서에는 PPO 에이전트 학습 및 평가를 위해 의도적으로 삽입된 10개의 수직적 권한 상승(관리자 API 권한 우회) 오류 정보를 명시합니다.

## 시스템 환경 및 규칙
* **대상 사이트**: site006 (AI Workflow Automation Platform)
* **포트**: 9905
* **탐지 기준**: 현재 사용자(`role=user`)의 세션 권한인 상태에서 관리자 전용 API 핸들러(`GET /api/admin/...`)를 직접 요청했을 때, 서버가 `403 Forbidden`을 응답하지 않고 관리자 전용 보호 데이터가 포함된 HTTP `200 OK` 상태 코드를 반환하는 경우.
* **평가 가중치(Reward Weight)**: 각 오류별 0.1

---

## 1. site006-bug01
* **bugId**: site006-bug01
* **csvId**: SEC-051
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/imports`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Imports API 호출
* **코드상 원인**: 해당 API 핸들러에서 세션 사용자의 `role`이 `admin`인지 검증하는 권한 제어 필터링이 누락됨.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 2. site006-bug02
* **bugId**: site006-bug02
* **csvId**: SEC-052
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/documents`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Documents API 호출
* **코드상 원인**: 해당 API 핸들러에서 세션의 역할 권한 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 3. site006-bug03
* **bugId**: site006-bug03
* **csvId**: SEC-053
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/teams`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Teams API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 4. site006-bug04
* **bugId**: site006-bug04
* **csvId**: SEC-054
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/roles`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Roles API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 5. site006-bug05
* **bugId**: site006-bug05
* **csvId**: SEC-055
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/audit-logs`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Audit Logs API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 6. site006-bug06
* **bugId**: site006-bug06
* **csvId**: SEC-056
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/subscriptions`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Subscriptions API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 7. site006-bug07
* **bugId**: site006-bug07
* **csvId**: SEC-057
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/devices`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Devices API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 8. site006-bug08
* **bugId**: site006-bug08
* **csvId**: SEC-058
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/api-keys`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 API Keys API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락. (메타데이터만 제공)
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 9. site006-bug09
* **bugId**: site006-bug09
* **csvId**: SEC-059
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/webhooks`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Webhooks API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 10. site006-bug10
* **bugId**: site006-bug10
* **csvId**: SEC-060
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/jobs`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Jobs API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.
