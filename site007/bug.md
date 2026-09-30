# site007 - 의도된 접근제어 오류 목록 (Permission Drift)

본 문서에는 PPO 에이전트 학습 및 평가를 위해 의도적으로 삽입된 10개의 권한 변경 후 재사용(Permission Drift) 오류 정보를 명시합니다.

## 시스템 환경 및 규칙
* **대상 사이트**: site007 (Hospital Management System)
* **포트**: 9906
* **탐지 기준**: 현재 사용자(`doctor` 또는 `nurse`)의 특정 기능 조회 권한이 회수(Revoke) 처리되었음에도 불구하고, 이미 발급된 기존 세션이 서버 메모리에 갱신되지 않고 남아있어, 보호 자원 API(`GET /api/...`)를 직접 요청했을 때 `403 Forbidden`을 응답하지 않고 보호 자원 데이터를 `200 OK` 상태 코드로 그대로 반환하는 경우.
* **평가 가중치(Reward Weight)**: 각 오류별 0.1

---

## 1. site007-bug01
* **bugId**: site007-bug01
* **csvId**: SEC-061
* **유형**: Permission Drift (권한 변경 후 이전 권한 재사용)
* **발생 API**: `GET /api/orders`
* **발생 조건**: doctor에게 Orders 조회 권한 부여 후 정상 접근 -> 관리자가 Orders 권한을 회수 -> 기존 session으로 다시 Orders API 호출
* **코드상 원인**: 해당 API 핸들러에서 권한 상태가 변경되었음에도 불구하고, 이미 생성된 클라이언트 세션 토큰 내부의 캐시된 권한 명세(`req.session.permissions`)를 참조하여 통과시킴.
* **기대되는 탐지 행동**: 권한 회수 이후에도 status가 `200`이며 보호 데이터가 반환되면 취약점으로 판단.

## 2. site007-bug02
* **bugId**: site007-bug02
* **csvId**: SEC-062
* **유형**: Permission Drift (권한 변경 후 이전 권한 재사용)
* **발생 API**: `GET /api/profile`
* **발생 조건**: Profile 조회 권한 회수 후 기존 session으로 재호출
* **코드상 원인**: 세션 권한 캐시 갱신 누락으로 인한 인가 정보 불일치.
* **기대되는 탐지 행동**: 권한 회수 이후에도 status가 `200`이며 보호 데이터가 반환되면 취약점으로 판단.

## 3. site007-bug03
* **bugId**: site007-bug03
* **csvId**: SEC-063
* **유형**: Permission Drift (권한 변경 후 이전 권한 재사용)
* **발생 API**: `GET /api/reports`
* **발생 조건**: Reports 권한 회수 후 기존 session으로 재호출
* **코드상 원인**: 세션 권한 캐시 갱신 누락으로 인한 인가 정보 불일치.
* **기대되는 탐지 행동**: 권한 회수 이후에도 status가 `200`이며 보호 데이터가 반환되면 취약점으로 판단.

## 4. site007-bug04
* **bugId**: site007-bug04
* **csvId**: SEC-064
* **유형**: Permission Drift (권한 변경 후 이전 권한 재사용)
* **발생 API**: `GET /api/invoices`
* **발생 조건**: Invoices 권한 회수 후 기존 session으로 재호출
* **코드상 원인**: 세션 권한 캐시 갱신 누락으로 인한 인가 정보 불일치.
* **기대되는 탐지 행동**: 권한 회수 이후에도 status가 `200`이며 보호 데이터가 반환되면 취약점으로 판단.

## 5. site007-bug05
* **bugId**: site007-bug05
* **csvId**: SEC-065
* **유형**: Permission Drift (권한 변경 후 이전 권한 재사용)
* **발생 API**: `GET /api/files`
* **발생 조건**: Files 권한 회수 후 기존 session으로 재호출
* **코드상 원인**: 세션 권한 캐시 갱신 누락으로 인한 인가 정보 불일치.
* **기대되는 탐지 행동**: 권한 회수 이후에도 status가 `200`이며 보호 데이터가 반환되면 취약점으로 판단.

## 6. site007-bug06
* **bugId**: site007-bug06
* **csvId**: SEC-066
* **유형**: Permission Drift (권한 변경 후 이전 권한 재사용)
* **발생 API**: `GET /api/messages`
* **발생 조건**: Messages 권한 회수 후 기존 session으로 재호출
* **코드상 원인**: 세션 권한 캐시 갱신 누락으로 인한 인가 정보 불일치.
* **기대되는 탐지 행동**: 권한 회수 이후에도 status가 `200`이며 보호 데이터가 반환되면 취약점으로 판단.

## 7. site007-bug07
* **bugId**: site007-bug07
* **csvId**: SEC-067
* **유형**: Permission Drift (권한 변경 후 이전 권한 재사용)
* **발생 API**: `GET /api/appointments`
* **발생 조건**: Appointments 권한 회수 후 기존 session으로 재호출
* **코드상 원인**: 세션 권한 캐시 갱신 누락으로 인한 인가 정보 불일치.
* **기대되는 탐지 행동**: 권한 회수 이후에도 status가 `200`이며 보호 데이터가 반환되면 취약점으로 판단.

## 8. site007-bug08
* **bugId**: site007-bug08
* **csvId**: SEC-068
* **유형**: Permission Drift (권한 변경 후 이전 권한 재사용)
* **발생 API**: `GET /api/cart`
* **발생 조건**: Cart 권한 회수 후 기존 session으로 재호출
* **코드상 원인**: 세션 권한 캐시 갱신 누락으로 인한 인가 정보 불일치.
* **기대되는 탐지 행동**: 권한 회수 이후에도 status가 `200`이며 보호 데이터가 반환되면 취약점으로 판단.

## 9. site007-bug09
* **bugId**: site007-bug09
* **csvId**: SEC-069
* **유형**: Permission Drift (권한 변경 후 이전 권한 재사용)
* **발생 API**: `GET /api/checkout`
* **발생 조건**: Checkout 권한 회수 후 기존 session으로 재호출
* **코드상 원인**: 세션 권한 캐시 갱신 누락으로 인한 인가 정보 불일치.
* **기대되는 탐지 행동**: 권한 회수 이후에도 status가 `200`이며 보호 데이터가 반환되면 취약점으로 판단.

## 10. site007-bug10
* **bugId**: site007-bug10
* **csvId**: SEC-070
* **유형**: Permission Drift (권한 변경 후 이전 권한 재사용)
* **발생 API**: `GET /api/search`
* **발생 조건**: Search 권한 회수 후 기존 session으로 재호출
* **코드상 원인**: 세션 권한 캐시 갱신 누락으로 인한 인가 정보 불일치.
* **기대되는 탐지 행동**: 권한 회수 이후에도 status가 `200`이며 보호 데이터가 반환되면 취약점으로 판단.
