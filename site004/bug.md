# site004 - 의도된 접근제어 오류 목록 (Vertical Privilege Escalation)

본 문서에는 PPO 에이전트 학습 및 평가를 위해 의도적으로 삽입된 9개의 수직적 권한 상승(관리자 API 권한 우회) 오류 정보를 명시합니다.

## 시스템 환경 및 규칙
* **대상 사이트**: site004 (기업 ERP 관리 시스템)
* **포트**: 9903
* **탐지 기준**: 현재 사용자(`role=user`)의 세션 권한인 상태에서 관리자 전용 API 핸들러(`GET /api/admin/...`)를 직접 요청했을 때, 서버가 `403 Forbidden`을 응답하지 않고 관리자 전용 보호 데이터(`protected_data`)를 `200 OK` 상태 코드와 함께 그대로 반환하는 경우.
* **평가 가중치(Reward Weight)**: 각 오류별 0.1

---

## 1. site004-bug01
* **bugId**: site004-bug01
* **csvId**: SEC-031
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/orders`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Orders API 호출
* **코드상 원인**: 해당 API 핸들러에서 세션 사용자의 `role`이 `admin`인지 검증하는 권한 제어 필터링이 누락됨.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 2. site004-bug02
* **bugId**: site004-bug02
* **csvId**: SEC-032
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/profile`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Profile API 호출
* **코드상 원인**: 해당 API 핸들러에서 세션의 역할 권한 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 3. site004-bug03
* **bugId**: site004-bug03
* **csvId**: SEC-033
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/reports`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Reports API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 4. site004-bug04
* **bugId**: site004-bug04
* **csvId**: SEC-034
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/invoices`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Invoices API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 5. site004-bug05
* **bugId**: site004-bug05
* **csvId**: SEC-035
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/files`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Files API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 6. site004-bug06
* **bugId**: site004-bug06
* **csvId**: SEC-036
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/messages`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Messages API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 7. site004-bug07
* **bugId**: site004-bug07
* **csvId**: SEC-037
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/appointments`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Appointments API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 8. site004-bug08
* **bugId**: site004-bug08
* **csvId**: SEC-038
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/cart`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Cart API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 9. site004-bug09
* **bugId**: site004-bug09
* **csvId**: SEC-039
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/checkout`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Checkout API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.
