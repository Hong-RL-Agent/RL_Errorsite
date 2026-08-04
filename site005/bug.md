# site005 - 의도된 접근제어 오류 목록 (Vertical Privilege Escalation)

본 문서에는 PPO 에이전트 학습 및 평가를 위해 의도적으로 삽입된 10개의 수직적 권한 상승(관리자 API 권한 우회) 오류 정보를 명시합니다.

## 시스템 환경 및 규칙
* **대상 사이트**: site005 (Marketplace Seller Center)
* **포트**: 9904
* **탐지 기준**: 현재 사용자(`role=user`)의 세션 권한인 상태에서 관리자 전용 API 핸들러(`GET /api/admin/...`)를 직접 요청했을 때, 서버가 `403 Forbidden`을 응답하지 않고 관리자 전용 보호 데이터(`protected_data`)를 `200 OK` 상태 코드와 함께 그대로 반환하는 경우.
* **평가 가중치(Reward Weight)**: 각 오류별 0.1

---

## 1. site005-bug01
* **bugId**: site005-bug01
* **csvId**: SEC-040
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/search`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Search API 호출
* **코드상 원인**: 해당 API 핸들러에서 세션 사용자의 `role`이 `admin`인지 검증하는 권한 제어 필터링이 누락됨.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 2. site005-bug02
* **bugId**: site005-bug02
* **csvId**: SEC-041
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/notifications`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Notifications API 호출
* **코드상 원인**: 해당 API 핸들러에서 세션의 역할 권한 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 3. site005-bug03
* **bugId**: site005-bug03
* **csvId**: SEC-042
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/payments`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Payments API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 4. site005-bug04
* **bugId**: site005-bug04
* **csvId**: SEC-043
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/shipping`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Shipping API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 5. site005-bug05
* **bugId**: site005-bug05
* **csvId**: SEC-044
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/returns`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Returns API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 6. site005-bug06
* **bugId**: site005-bug06
* **csvId**: SEC-045
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/reviews`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Reviews API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 7. site005-bug07
* **bugId**: site005-bug07
* **csvId**: SEC-046
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/coupons`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Coupons API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 8. site005-bug08
* **bugId**: site005-bug08
* **csvId**: SEC-047
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/wishlist`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Wishlist API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 9. site005-bug09
* **bugId**: site005-bug09
* **csvId**: SEC-048
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/support`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Support API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.

## 10. site005-bug10
* **bugId**: site005-bug10
* **csvId**: SEC-049
* **유형**: Vertical Privilege Escalation (관리자 API 권한 우회)
* **발생 API**: `GET /api/admin/analytics`
* **발생 조건**: `role=user` 로그인 상태에서 관리자 Analytics API 호출
* **코드상 원인**: 해당 API 핸들러에서 역할 권한 검증 로직 누락.
* **기대되는 탐지 행동**: `role`이 `user`일 때 해당 API를 통해 보호 데이터가 포함된 HTTP `200`을 반환받으면 취약점으로 판단.
