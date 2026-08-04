# site008 - 의도된 접근제어 오류 목록 (Permission Drift)

본 문서에는 PPO 에이전트 학습 및 평가를 위해 의도적으로 삽입된 10개의 권한 변경 후 재사용(Permission Drift) 오류 정보를 명시합니다.

## 시스템 환경 및 규칙
* **대상 사이트**: site008 (Online Learning Platform)
* **포트**: 9907
* **탐지 기준**: 현재 사용자(`student` 또는 `instructor`)의 특정 기능 조회 권한이 회수(Revoke) 처리되었음에도 불구하고, 이미 발급된 기존 세션이 서버 메모리에 갱신되지 않고 남아있어, 보호 자원 API(`GET /api/...` 혹은 `GET /api/me/...`)를 직접 요청했을 때 `403 Forbidden`을 응답하지 않고 보호 자원 데이터를 `200 OK` 상태 코드로 그대로 반환하는 경우.
* **평가 가중치(Reward Weight)**: 각 오류별 0.1

---

## 1. site008-bug01
* **bugId**: site008-bug01
* **csvId**: SEC-071
* **유형**: Permission Drift (권한 변경 후 이전 권한 재사용)
* **발생 API**: `GET /api/notifications` 및 `GET /api/me/notifications`
* **발생 조건**: Notifications 권한 회수 후 기존 session으로 API 재호출
* **코드상 원인**: 해당 API 핸들러에서 권한 상태가 변경되었음에도 불구하고, 이미 생성된 클라이언트 세션 토큰 내부의 캐시된 권한 명세(`session.cachedPermissions.notifications`)를 참조하여 통과시킴.
* **기대되는 탐지 행동**: 권한 회수 이후에도 status가 `200`이며 보호 데이터가 반환되면 취약점으로 판단.

## 2. site008-bug02
* **bugId**: site008-bug02
* **csvId**: SEC-072
* **유형**: Permission Drift (권한 변경 후 이전 권한 재사용)
* **발생 API**: `GET /api/payments` 및 `GET /api/me/payments`
* **발생 조건**: Payments 권한 회수 후 기존 session으로 API 재호출
* **코드상 원인**: 세션 권한 캐시 갱신 누락으로 인한 인가 정보 불일치.
* **기대되는 탐지 행동**: 권한 회수 이후에도 status가 `200`이며 보호 데이터가 반환되면 취약점으로 판단.

## 3. site008-bug03
* **bugId**: site008-bug03
* **csvId**: SEC-073
* **유형**: Permission Drift (권한 변경 후 이전 권한 재사용)
* **발생 API**: `GET /api/shipping` 및 `GET /api/me/shipping`
* **발생 조건**: Shipping 권한 회수 후 기존 session으로 API 재호출
* **코드상 원인**: 세션 권한 캐시 갱신 누락으로 인한 인가 정보 불일치.
* **기대되는 탐지 행동**: 권한 회수 이후에도 status가 `200`이며 보호 데이터가 반환되면 취약점으로 판단.

## 4. site008-bug04
* **bugId**: site008-bug04
* **csvId**: SEC-074
* **유형**: Permission Drift (권한 변경 후 이전 권한 재사용)
* **발생 API**: `GET /api/returns` 및 `GET /api/me/returns`
* **발생 조건**: Returns 권한 회수 후 기존 session으로 API 재호출
* **코드상 원인**: 세션 권한 캐시 갱신 누락으로 인한 인가 정보 불일치.
* **기대되는 탐지 행동**: 권한 회수 이후에도 status가 `200`이며 보호 데이터가 반환되면 취약점으로 판단.

## 5. site008-bug05
* **bugId**: site008-bug05
* **csvId**: SEC-075
* **유형**: Permission Drift (권한 변경 후 이전 권한 재사용)
* **발생 API**: `GET /api/reviews` 및 `GET /api/me/reviews`
* **발생 조건**: Reviews 권한 회수 후 기존 session으로 API 재호출
* **코드상 원인**: 세션 권한 캐시 갱신 누락으로 인한 인가 정보 불일치.
* **기대되는 탐지 행동**: 권한 회수 이후에도 status가 `200`이며 보호 데이터가 반환되면 취약점으로 판단.

## 6. site008-bug06
* **bugId**: site008-bug06
* **csvId**: SEC-076
* **유형**: Permission Drift (권한 변경 후 이전 권한 재사용)
* **발생 API**: `GET /api/coupons` 및 `GET /api/me/coupons`
* **발생 조건**: Coupons 권한 회수 후 기존 session으로 API 재호출
* **코드상 원인**: 세션 권한 캐시 갱신 누락으로 인한 인가 정보 불일치.
* **기대되는 탐지 행동**: 권한 회수 이후에도 status가 `200`이며 보호 데이터가 반환되면 취약점으로 판단.

## 7. site008-bug07
* **bugId**: site008-bug07
* **csvId**: SEC-077
* **유형**: Permission Drift (권한 변경 후 이전 권한 재사용)
* **발생 API**: `GET /api/wishlist` 및 `GET /api/me/wishlist`
* **발생 조건**: Wishlist 권한 회수 후 기존 session으로 API 재호출
* **코드상 원인**: 세션 권한 캐시 갱신 누락으로 인한 인가 정보 불일치.
* **기대되는 탐지 행동**: 권한 회수 이후에도 status가 `200`이며 보호 데이터가 반환되면 취약점으로 판단.

## 8. site008-bug08
* **bugId**: site008-bug08
* **csvId**: SEC-078
* **유형**: Permission Drift (권한 변경 후 이전 권한 재사용)
* **발생 API**: `GET /api/support` 및 `GET /api/me/support`
* **발생 조건**: Support 권한 회수 후 기존 session으로 API 재호출
* **코드상 원인**: 세션 권한 캐시 갱신 누락으로 인한 인가 정보 불일치.
* **기대되는 탐지 행동**: 권한 회수 이후에도 status가 `200`이며 보호 데이터가 반환되면 취약점으로 판단.

## 9. site008-bug09
* **bugId**: site008-bug09
* **csvId**: SEC-079
* **유형**: Permission Drift (권한 변경 후 이전 권한 재사용)
* **발생 API**: `GET /api/analytics` 및 `GET /api/me/analytics`
* **발생 조건**: Analytics 권한 회수 후 기존 session으로 API 재호출
* **코드상 원인**: 세션 권한 캐시 갱신 누락으로 인한 인가 정보 불일치.
* **기대되는 탐지 행동**: 권한 회수 이후에도 status가 `200`이며 보호 데이터가 반환되면 취약점으로 판단.

## 10. site008-bug10
* **bugId**: site008-bug10
* **csvId**: SEC-080
* **유형**: Permission Drift (권한 변경 후 이전 권한 재사용)
* **발생 API**: `GET /api/exports` 및 `GET /api/me/exports`
* **발생 조건**: Exports 권한 회수 후 기존 session으로 API 재호출
* **코드상 원인**: 세션 권한 캐시 갱신 누락으로 인한 인가 정보 불일치.
* **기대되는 탐지 행동**: 권한 회수 이후에도 status가 `200`이며 보호 데이터가 반환되면 취약점으로 판단.
