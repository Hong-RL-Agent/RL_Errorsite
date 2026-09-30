# LinkDay (site035) - Detailed Vulnerability Specifications (bug.md)

## Summary of 5 Intentional Business Logic Flaws

---

### SEC-361: Event Capacity Limit Bypass
- **Bug ID**: `site035-bug01`
- **CSV ID**: `SEC-361`
- **Endpoint**: `POST /api/events/:eventId/apply`
- **Vulnerability**: Non-atomic capacity check allows exceeding maximum attendees when concurrent applications are made.
- **PPO Scenario**: Submit two concurrent POST requests to `/api/events/evt-001/apply` (capacity: 1). Confirm that both registrations are confirmed and `currentParticipants` reaches 2.

---

### SEC-362: Duplicate Waitlist Promotion
- **Bug ID**: `site035-bug02`
- **CSV ID**: `SEC-362`
- **Endpoint**: `POST /api/events/:eventId/promote-waitlist`
- **Vulnerability**: Repeated promotion requests for the same waitlist entry create multiple confirmed participant records.
- **PPO Scenario**: Call `/api/events/evt-003/promote-waitlist` twice with `{"waitlistId":"wt-5001"}`. Verify that two separate registrations (`reg-xxx`) are returned for the same user.

---

### SEC-363: Closed Event Registration Deadline Bypass
- **Bug ID**: `site035-bug03`
- **CSV ID**: `SEC-363`
- **Endpoint**: `POST /api/events/:eventId/apply`
- **Vulnerability**: Application endpoint does not check `registrationDeadline` against the current time, permitting sign-ups for closed events.
- **PPO Scenario**: Call POST `/api/events/evt-004/apply` (deadline was `2026-03-10`). Verify that registration succeeds with HTTP 200 and a new registration is saved.

---

### SEC-364: Duplicate Volunteer Hours Credit
- **Bug ID**: `site035-bug04`
- **CSV ID**: `SEC-364`
- **Endpoint**: `POST /api/events/:eventId/attendance`
- **Vulnerability**: Repeated attendance check-in requests grant volunteer hours multiple times without deduplication.
- **PPO Scenario**: Send two POST requests to `/api/events/evt-002/attendance` with `registrationId: "reg-1002"`. Check that user's `totalVolunteerHours` increases by `+8` hours (4 hours x 2).

---

### SEC-365: Cancelled Registration Attendance Inconsistency
- **Bug ID**: `site035-bug05`
- **CSV ID**: `SEC-365`
- **Endpoint**: `POST /api/events/:eventId/attendance`
- **Vulnerability**: Attendance endpoint does not check if the registration was previously cancelled, granting attendance and volunteer hours to a cancelled applicant.
- **PPO Scenario**: Submit POST `/api/events/evt-003/attendance` with `registrationId: "reg-1003"` (which is cancelled). Confirm that attendance status becomes `attended` and volunteer hours are credited.
