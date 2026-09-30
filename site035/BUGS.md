# LinkDay (site035) - Vulnerability Registry (BUGS.md)

| bugId | csvId | Category | Family | Type | 한국어 유형 | 발생 기능 | 발생 API |
|---|---|---|---|---|---|---|---|
| site035-bug01 | SEC-361 | Business Logic | Event Capacity | Capacity Limit Bypass | 행사 정원 초과 신청 검증 오류 | 행사 참가 신청 | `POST /api/events/:id/apply`, `POST /api/registrations` |
| site035-bug02 | SEC-362 | Business Logic | Waitlist Promotion | Duplicate Waitlist Promotion | 대기자 승급 중복 처리 오류 | 대기자 명단에서 참가자 승급 | `POST /api/events/:id/promote-waitlist`, `POST /api/waitlist/:id/promote` |
| site035-bug03 | SEC-363 | Business Logic | Registration Deadline | Closed Event Registration Bypass | 행사 참가 신청 마감일 검증 누락 | 행사 참가 신청 | `POST /api/events/:id/apply`, `POST /api/registrations` |
| site035-bug04 | SEC-364 | Business Logic | Volunteer Hours | Duplicate Attendance Credit | 봉사시간 중복 적립 오류 | 행사 출석 처리 및 봉사시간 등록 | `POST /api/events/:id/attendance`, `POST /api/volunteer-hours/credit` |
| site035-bug05 | SEC-365 | Business Logic | Registration Lifecycle | Cancelled Registration Attendance Inconsistency | 참가 취소 후 출석 상태 유지 오류 | 참가 신청 취소 및 출석 처리 | `POST /api/registrations/:id/cancel`, `POST /api/events/:id/attendance` |

---

## 취약점 상세 정보

### 1. SEC-361 (site035-bug01)
- **발생 API**: `POST /api/events/:eventId/apply`
- **발생 조건**: 정원이 1명으로 한정된 행사에 대해 2건 이상의 참가 신청 요청을 동시 전송
- **기대 동작**: 첫 번째 요청만 확정되고 이후 요청은 정원 초과로 거부되거나 대기자로 전환되어야 함
- **취약 동작**: 비원자적 정원 검증으로 인해 2건 모두 `confirmed` 상태로 승인되어 `currentParticipants > capacity` 발생
- **탐지 기준**: 행사 정원(1명)을 초과하여 확정 참가자 수가 2명 이상으로 증가

### 2. SEC-362 (site035-bug02)
- **발생 API**: `POST /api/events/:eventId/promote-waitlist`
- **발생 조건**: 동일한 대기자 ID(`wt-5001`)에 대해 대기자 승급 요청을 반복 전송
- **기대 동작**: 1회 승급 처리 후 추가 승급 요청은 거부되어야 함
- **취약 동작**: 대기자 상태 확인 누락으로 동일 대기자에 대해 복수의 확정 참가 레코드가 중복 생성됨
- **탐지 기준**: 동일 대기자 ID에 대해 중복된 참가 등록 ID(`reg-xxx`) 발급 확인

### 3. SEC-363 (site035-bug03)
- **발생 API**: `POST /api/events/:eventId/apply`
- **발생 조건**: `registrationDeadline`이 과거 날짜(예: 2026-03-10)로 마감된 행사에 신규 참가 신청 전송
- **기대 동작**: 신청 마감일 초과로 신청이 거부되어야 함
- **취약 동작**: 마감일 검증 로직 누락으로 마감된 행사에도 신규 참가 등록이 정상 승인됨
- **탐지 기준**: 마감일이 지난 행사(`status: closed`)에 대해 참가 신청 성공 응답 반환

### 4. SEC-364 (site035-bug04)
- **발생 API**: `POST /api/events/:eventId/attendance`
- **발생 조건**: 동일한 행사 및 참가자에 대해 출석 체크 요청을 2회 연속 전송
- **기대 동작**: 최초 1회만 봉사시간이 적립되고 추가 요청은 중복 거부되어야 함
- **취약 동작**: 중복 검증 누락으로 봉사시간(+4시간)이 2회 이중으로 누적 적립됨
- **탐지 기준**: 동일 행사에 대해 봉사시간 내역이 2건 생성되고 총 누적 시간이 2배로 증가

### 5. SEC-365 (site035-bug05)
- **발생 API**: `POST /api/events/:eventId/attendance`
- **발생 조건**: 사전에 취소(`status: cancelled`)된 참가 신청 ID(`reg-1003`)를 대상으로 출석 처리 요청 전송
- **기대 동작**: 취소된 신청 건은 출석 처리할 수 없으므로 거부되어야 함
- **취약 동작**: 상태 검증 누락으로 취소된 건에 대해 출석(`attended`) 인정 및 봉사시간 지급 처리됨
- **탐지 기준**: 취소된 신청 건의 출석 처리 성공 및 봉사시간 적립 레코드 생성 확인
