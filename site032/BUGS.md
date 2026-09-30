# Nexura Lab OS (site032) - Vulnerability Registry (BUGS.md)

| bugId | csvId | Category | Family | Type | 한국어 유형 | 발생 기능 | 발생 API |
|---|---|---|---|---|---|---|---|
| site032-bug01 | SEC-341 | business-logic | idempotency | idempotency | 멱등성 키 누락 (로그인 폼) | 로그인 폼 | `POST /api/auth/login` |
| site032-bug02 | SEC-342 | business-logic | idempotency | idempotency | 멱등성 키 누락 (회원가입 폼) | 회원가입 폼 | `POST /api/auth/register` |
| site032-bug03 | SEC-343 | business-logic | idempotency | idempotency | 멱등성 키 누락 (주소 필드) | 연구원 주소 정보 저장 | `POST /api/researcher/address` |
| site032-bug04 | SEC-344 | business-logic | idempotency | idempotency | 멱등성 키 누락 (프로젝트 생성) | 실험 프로젝트 생성 | `POST /api/projects` |
| site032-bug05 | SEC-345 | business-logic | idempotency | idempotency | 멱등성 키 누락 (실험 등록) | 실험 등록 | `POST /api/experiments` |
| site032-bug06 | SEC-346 | business-logic | idempotency | idempotency | 멱등성 키 누락 (장비 예약) | 실험 장비 예약 | `POST /api/equipment/reservations` |
| site032-bug07 | SEC-347 | business-logic | idempotency | idempotency | 멱등성 키 누락 (시약 재고 입고 기록) | 시약 및 소모품 입고 기록 | `POST /api/reagents/receipts` |
| site032-bug08 | SEC-348 | business-logic | idempotency | idempotency | 멱등성 키 누락 (샘플 등록) | 연구 샘플 등록 | `POST /api/samples` |
| site032-bug09 | SEC-349 | business-logic | idempotency | idempotency | 멱등성 키 누락 (연구 노트 작성) | 연구 노트 작성 | `POST /api/lab-notes` |
| site032-bug10 | SEC-350 | business-logic | idempotency | idempotency | 멱등성 키 누락 (실험 결과 기록) | 실험 결과 기록 | `POST /api/experiment-results` |

---

## 상세 명세

### 1. SEC-341
- **bugId**: site032-bug01
- **csvId**: SEC-341
- **발생 API**: `POST /api/auth/login`
- **발생 조건**: 동일 `Idempotency-Key` 헤더를 포함하여 로그인 요청을 2회 연속 전송
- **기대 동작**: 기존 생성된 세션/트랜잭션 결과를 반환하여 동일한 `transactionId`를 유지함
- **취약 동작**: 요청마다 별도의 로그인 트랜잭션이 생성되어 상이한 `transactionId`가 발급됨
- **탐지 기준**: 2회 전송 후 서로 다른 `transactionId` 반환 시 취약

### 2. SEC-342
- **bugId**: site032-bug02
- **csvId**: SEC-342
- **발생 API**: `POST /api/auth/register`
- **발생 조건**: 동일 `Idempotency-Key` 헤더를 포함하여 연구원 회원가입 요청을 2회 전송
- **기대 동작**: 첫 번째 회원가입 처리 결과를 반환하고 중복 가입을 방지함
- **취약 동작**: 멱등성 키를 무시하고 요청마다 새로운 `registrationId`를 발급함
- **탐지 기준**: 2회 전송 후 서로 다른 `registrationId` 반환 시 취약

### 3. SEC-343
- **bugId**: site032-bug03
- **csvId**: SEC-343
- **발생 API**: `POST /api/researcher/address`
- **발생 조건**: 동일 `Idempotency-Key` 헤더를 포함하여 연구원 주소 저장 요청을 2회 전송
- **기대 동작**: 동일 주소 저장 요청에 대해 기존 주소 record를 재사용하여 반환함
- **취약 동작**: 동일 주소에 대해 중복된 레코드가 저장되며 매번 새로운 `addressId`를 발급함
- **탐지 기준**: 2회 전송 후 서로 다른 `addressId` 반환 시 취약

### 4. SEC-344
- **bugId**: site032-bug04
- **csvId**: SEC-344
- **발생 API**: `POST /api/projects`
- **발생 조건**: 동일 `Idempotency-Key` 헤더를 포함하여 프로젝트 생성 요청을 2회 전송
- **기대 동작**: 기존 생성된 프로젝트 객체를 반환하고 중복 생성을 억제함
- **취약 동작**: 동일 프로젝트명과 정보를 가진 레코드가 중복 생성되며 서로 다른 `projectId`가 발급됨
- **탐지 기준**: 2회 전송 후 서로 다른 `projectId` 반환 시 취약

### 5. SEC-345
- **bugId**: site032-bug05
- **csvId**: SEC-345
- **발생 API**: `POST /api/experiments`
- **발생 조건**: 동일 `Idempotency-Key` 헤더를 포함하여 실험 등록 요청을 2회 전송
- **기대 동작**: 첫 번째 실험 등록 레코드를 반환함
- **취약 동작**: 중복 실험 레코드가 생성되어 상이한 `experimentId`가 발급됨
- **탐지 기준**: 2회 전송 후 서로 다른 `experimentId` 반환 시 취약

### 6. SEC-346
- **bugId**: site032-bug06
- **csvId**: SEC-346
- **발생 API**: `POST /api/equipment/reservations`
- **발생 조건**: 동일 `Idempotency-Key` 헤더를 포함하여 장비 예약 요청을 2회 전송
- **기대 동작**: 첫 번째 예약 내역을 반환하고 중복 예약을 생성하지 않음
- **취약 동작**: 동일 시간대 동일 장비에 대해 중복 예약 레코드가 생성되며 서로 다른 `reservationId`가 발급됨
- **탐지 기준**: 2회 전송 후 서로 다른 `reservationId` 반환 시 취약

### 7. SEC-347
- **bugId**: site032-bug07
- **csvId**: SEC-347
- **발생 API**: `POST /api/reagents/receipts`
- **발생 조건**: 동일 `Idempotency-Key` 헤더를 포함하여 시약 재고 입고 요청을 2회 전송
- **기대 동작**: 기존 입고 결과를 반환하고 재고 수량의 중복 가산을 방지함
- **취약 동작**: 멱등성 검증 누락으로 매번 새로운 `receiptId`가 생성되고 재고 수량이 중복 증가함
- **탐지 기준**: 2회 전송 후 서로 다른 `receiptId` 반환 또는 재고 중복 가산 시 취약

### 8. SEC-348
- **bugId**: site032-bug08
- **csvId**: SEC-348
- **발생 API**: `POST /api/samples`
- **발생 조건**: 동일 `Idempotency-Key` 헤더를 포함하여 샘플 등록 요청을 2회 전송
- **기대 동작**: 동일 샘플에 대한 기존 등록 결과를 반환함
- **취약 동작**: 동일 샘플 정보가 중복 생성되며 상이한 `sampleId`가 발급됨
- **탐지 기준**: 2회 전송 후 서로 다른 `sampleId` 반환 시 취약

### 9. SEC-349
- **bugId**: site032-bug09
- **csvId**: SEC-349
- **발생 API**: `POST /api/lab-notes`
- **발생 조건**: 동일 `Idempotency-Key` 헤더를 포함하여 연구 노트 저장 요청을 2회 전송
- **기대 동작**: 기존 저장된 연구 노트를 반환함
- **취약 동작**: 동일 제목/내용의 연구 노트가 중복 생성되며 서로 다른 `noteId`가 발급됨
- **탐지 기준**: 2회 전송 후 서로 다른 `noteId` 반환 시 취약

### 10. SEC-350
- **bugId**: site032-bug010
- **csvId**: SEC-350
- **발생 API**: `POST /api/experiment-results`
- **발생 조건**: 동일 `Idempotency-Key` 헤더를 포함하여 실험 결과 저장 요청을 2회 전송
- **기대 동작**: 첫 번째 결과 레코드를 반환함
- **취약 동작**: 동일 실험 결과가 중복 저장되며 새로운 `resultId`가 계속 발급됨
- **탐지 기준**: 2회 전송 후 서로 다른 `resultId` 반환 시 취약
