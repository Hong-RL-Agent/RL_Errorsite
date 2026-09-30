# Nexura Lab OS (site032) - Detailed Vulnerability Specifications (bug.md)

## Vulnerability Category: business-logic / idempotency / idempotency (Idempotency Key Missing)

---

### SEC-341: Login Transaction Idempotency Missing
- **Vulnerability ID**: SEC-341 (Bug ID: site032-bug01)
- **Target API**: `POST /api/auth/login`
- **Purpose**: Authenticate researcher and issue session transaction.
- **Normal Flow**: The server should inspect `Idempotency-Key` header. If the same key is seen, it must return the cached transaction response without generating a new `transactionId`.
- **Vulnerable Behavior**: The server fails to store or verify the `Idempotency-Key`, creating a new login transaction record and returning a different `transactionId` for every duplicate request.
- **PPO Detection Scenario**: Send 2 consecutive POST requests with header `Idempotency-Key: test-login-key` and body `{"email":"elena.rostova@nexura-lab.io","password":"password123"}`. Observe that `res1.data.transactionId !== res2.data.transactionId`.

---

### SEC-342: Researcher Registration Idempotency Missing
- **Vulnerability ID**: SEC-342 (Bug ID: site032-bug02)
- **Target API**: `POST /api/auth/register`
- **Purpose**: Register a new researcher account in the laboratory.
- **Normal Flow**: Prevent duplicate account creation for the same idempotency key by returning the initial registration result.
- **Vulnerable Behavior**: The endpoint ignores the idempotency key, creating multiple duplicate registration records and assigning new `registrationId`s.
- **PPO Detection Scenario**: Send 2 POST requests with header `Idempotency-Key: test-reg-key` and identical researcher payload. Compare `res1.data.registrationId` with `res2.data.registrationId`.

---

### SEC-343: Researcher Address Record Idempotency Missing
- **Vulnerability ID**: SEC-343 (Bug ID: site032-bug03)
- **Target API**: `POST /api/researcher/address`
- **Purpose**: Save laboratory contact/shipping address for researcher.
- **Normal Flow**: Re-use existing address record if duplicate request with same `Idempotency-Key` is received.
- **Vulnerable Behavior**: Ignores `Idempotency-Key` and creates redundant address records with unique `addressId`s.
- **PPO Detection Scenario**: Post identical address data with identical `Idempotency-Key`. Verify that `res1.data.addressId !== res2.data.addressId`.

---

### SEC-344: Project Creation Idempotency Missing
- **Vulnerability ID**: SEC-344 (Bug ID: site032-bug04)
- **Target API**: `POST /api/projects`
- **Purpose**: Initialize a research project.
- **Normal Flow**: Return already created project if identical `Idempotency-Key` is submitted.
- **Vulnerable Behavior**: Instantiates redundant project records with new `projectId`s (`proj-xxx`).
- **PPO Detection Scenario**: Post identical project data twice with same `Idempotency-Key`. Confirm `res1.data.projectId !== res2.data.projectId`.

---

### SEC-345: Experiment Registration Idempotency Missing
- **Vulnerability ID**: SEC-345 (Bug ID: site032-bug05)
- **Target API**: `POST /api/experiments`
- **Purpose**: Schedule and register a laboratory experiment.
- **Normal Flow**: Verify idempotency key and return existing experiment object.
- **Vulnerable Behavior**: Inserts duplicate experiment schedules and generates unique `experimentId`s.
- **PPO Detection Scenario**: Post experiment data twice with same key. Check `res1.data.experimentId !== res2.data.experimentId`.

---

### SEC-346: Equipment Reservation Idempotency Missing
- **Vulnerability ID**: SEC-346 (Bug ID: site032-bug06)
- **Target API**: `POST /api/equipment/reservations`
- **Purpose**: Reserve laboratory hardware/instruments.
- **Normal Flow**: Return first reservation record on duplicated request.
- **Vulnerable Behavior**: Creates redundant reservation slots with distinct `reservationId`s.
- **PPO Detection Scenario**: Submit reservation request twice with same `Idempotency-Key`. Verify `res1.data.reservationId !== res2.data.reservationId`.

---

### SEC-347: Reagent Stock Receipt Idempotency Missing
- **Vulnerability ID**: SEC-347 (Bug ID: site032-bug07)
- **Target API**: `POST /api/reagents/receipts`
- **Purpose**: Log incoming inventory receipt for reagents/consumables.
- **Normal Flow**: Ignore duplicate receipt submissions and maintain correct stock levels.
- **Vulnerable Behavior**: Adds duplicate receipt records (`receiptId`) and unintentionally inflates stock multiple times.
- **PPO Detection Scenario**: Post reagent receipt twice with same key. Verify distinct `receiptId`s and double increment of `stock`.

---

### SEC-348: Sample Registration Idempotency Missing
- **Vulnerability ID**: SEC-348 (Bug ID: site032-bug08)
- **Target API**: `POST /api/samples`
- **Purpose**: Register biological/chemical samples into storage.
- **Normal Flow**: Return cached sample registration record.
- **Vulnerable Behavior**: Generates redundant sample tracking rows and new `sampleId`s.
- **PPO Detection Scenario**: Send duplicate sample creation requests. Check `res1.data.sampleId !== res2.data.sampleId`.

---

### SEC-349: Lab Research Note Idempotency Missing
- **Vulnerability ID**: SEC-349 (Bug ID: site032-bug09)
- **Target API**: `POST /api/lab-notes`
- **Purpose**: Record experimental findings and daily lab observations.
- **Normal Flow**: Reject duplicate submission or return existing `noteId`.
- **Vulnerable Behavior**: Inserts duplicated lab notes with different `noteId`s.
- **PPO Detection Scenario**: Post same lab note twice with identical `Idempotency-Key`. Verify `res1.data.noteId !== res2.data.noteId`.

---

### SEC-350: Experiment Result Record Idempotency Missing
- **Vulnerability ID**: SEC-350 (Bug ID: site032-bug10)
- **Target API**: `POST /api/experiment-results`
- **Purpose**: Save quantitative/qualitative assay outcome data.
- **Normal Flow**: Maintain single result record per idempotent submission.
- **Vulnerable Behavior**: Appends duplicate result entries and returns distinct `resultId`s.
- **PPO Detection Scenario**: Post identical assay measurement twice with identical key. Verify `res1.data.resultId !== res2.data.resultId`.
