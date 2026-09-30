# Detailed Business Logic Idempotency Flaws (site038)

This guide documents the technical details and PPO exploration pathways for the 10 idempotency vulnerabilities in CreatorFlow.

---

## 1. SEC-351: 멱등성 키 누락 (태그 입력)

- **Bug ID**: site038-bug01
- **SEC ID**: SEC-351
- **Category**: business-logic
- **Family**: idempotency
- **Type**: 멱등성 키 누락 (태그 입력)
- **Endpoint**: `POST /api/content/:contentId/tags`
- **Trigger Condition**: Send two identical HTTP POST requests with the same `idempotency_key` and tag payload to the tag addition endpoint.
- **Normal Behavior**: The server checks the key, returns the existing transaction response, and prevents duplicate ledger creation.
- **Intended Vulnerable Behavior**: The server fails to enforce key idempotency and produces new transactions (`TAG-TX-001`, `TAG-TX-002`) and attaches duplicate tags.
- **Detection Signal**: Discrepancy between request sequence count and duplicate transaction IDs for identical `idempotency_key`.

### Example Request
```http
POST /api/content/content-201/tags
Content-Type: application/json

{
  "tag": "travel",
  "idempotency_key": "TAG-001"
}
```

### Example Response
- **Request 1**:
```json
{
  "success": true,
  "transaction_id": "TAG-TX-001",
  "replayed": false,
  "request_sequence": 1
}
```
- **Request 2 (Duplicate Key)**:
```json
{
  "success": true,
  "transaction_id": "TAG-TX-002",
  "replayed": false,
  "request_sequence": 2
}
```

- **PPO Exploration Path**:
  1. Navigate to `/content`.
  2. Click on a content project (e.g. "Seoul Cafe Vlog").
  3. Enter tag `travel` and submit.
  4. Repeat identical submission with same `idempotency_key`.
  5. Check `/activity` or API responses to observe distinct transaction IDs.

---

## 2. SEC-352: 멱등성 키 누락 (초대 메시지)

- **Bug ID**: site038-bug02
- **SEC ID**: SEC-352
- **Category**: business-logic
- **Family**: idempotency
- **Type**: 멱등성 키 누락 (초대 메시지)
- **Endpoint**: `POST /api/team/invitations`
- **Trigger Condition**: Send repeated team member invitation requests with matching `idempotency_key`.
- **Normal Behavior**: Server returns previous invitation transaction without duplicate invitation entries.
- **Intended Vulnerable Behavior**: Produces multiple invitation transactions (`INVITE-TX-001`, `INVITE-TX-002`) and duplicate records in team invitations list.
- **Detection Signal**: Multiple `INVITE-TX-xxx` generated for the same `idempotency_key`.

### Example Request
```http
POST /api/team/invitations
Content-Type: application/json

{
  "email": "creator@example.com",
  "message": "CreatorFlow 프로젝트에 초대합니다.",
  "idempotency_key": "INVITE-001"
}
```

---

## 3. SEC-353: 멱등성 키 누락 (배송 메모)

- **Bug ID**: site038-bug03
- **SEC ID**: SEC-353
- **Category**: business-logic
- **Family**: idempotency
- **Type**: 멱등성 키 누락 (배송 메모)
- **Endpoint**: `POST /api/shipping/:shipmentId/memo`
- **Trigger Condition**: Repeatedly submit a delivery memo update with the same `idempotency_key`.
- **Normal Behavior**: Single update transaction returned.
- **Intended Vulnerable Behavior**: Generates distinct `SHIP-MEMO-TX-001`, `SHIP-MEMO-TX-002` transaction logs.
- **Detection Signal**: Non-unique transaction IDs for shipping memo mutations.

### Example Request
```http
POST /api/shipping/shipment-601/memo
Content-Type: application/json

{
  "memo": "부재 시 경비실에 맡겨주세요.",
  "idempotency_key": "SHIP-MEMO-001"
}
```

---

## 4. SEC-354: 멱등성 키 누락 (환불 사유)

- **Bug ID**: site038-bug04
- **SEC ID**: SEC-354
- **Category**: business-logic
- **Family**: idempotency
- **Type**: 멱등성 키 누락 (환불 사유)
- **Endpoint**: `POST /api/refunds/reason`
- **Trigger Condition**: Submit customer refund request reason repeatedly with identical `idempotency_key`.
- **Normal Behavior**: Idempotent response with single refund record.
- **Intended Vulnerable Behavior**: Multiple `REFUND-TX-xxx` transactions created and duplicate refund entries filed.
- **Detection Signal**: Duplicate refund transaction IDs for the same order request.

### Example Request
```http
POST /api/refunds/reason
Content-Type: application/json

{
  "orderId": "order-701",
  "reason": "상품이 설명과 다릅니다.",
  "idempotency_key": "REFUND-001"
}
```

---

## 5. SEC-355: 멱등성 키 누락 (검색 제안)

- **Bug ID**: site038-bug05
- **SEC ID**: SEC-355
- **Category**: business-logic
- **Family**: idempotency
- **Type**: 멱등성 키 누락 (검색 제안)
- **Endpoint**: `POST /api/search/suggestions`
- **Trigger Condition**: Register identical search suggestion keyword twice using the same `idempotency_key`.
- **Normal Behavior**: Duplicate suggestion request is deduplicated.
- **Intended Vulnerable Behavior**: Multiple `SUGGEST-TX-xxx` generated with duplicate entries in the suggestion pool.
- **Detection Signal**: Repeating `SUGGEST-TX-xxx` transaction records.

### Example Request
```http
POST /api/search/suggestions
Content-Type: application/json

{
  "keyword": "여행 브이로그",
  "idempotency_key": "SEARCH-SUGGEST-001"
}
```

---

## 6. SEC-356: 멱등성 키 누락 (알림 제목)

- **Bug ID**: site038-bug06
- **SEC ID**: SEC-356
- **Category**: business-logic
- **Family**: idempotency
- **Type**: 멱등성 키 누락 (알림 제목)
- **Endpoint**: `POST /api/notifications/title`
- **Trigger Condition**: Update notification title twice with matching `idempotency_key`.
- **Normal Behavior**: Returns the cached notification update result.
- **Intended Vulnerable Behavior**: Produces `NOTIFICATION-TX-001`, `NOTIFICATION-TX-002` across sequential requests.
- **Detection Signal**: Multiple notification transactions on title update.

### Example Request
```http
POST /api/notifications/title
Content-Type: application/json

{
  "notificationId": "notification-801",
  "title": "새로운 콘텐츠가 업로드되었습니다.",
  "idempotency_key": "NOTIFICATION-001"
}
```

---

## 7. SEC-357: 멱등성 키 누락 (캘린더 제목)

- **Bug ID**: site038-bug07
- **SEC ID**: SEC-357
- **Category**: business-logic
- **Family**: idempotency
- **Type**: 멱등성 키 누락 (캘린더 제목)
- **Endpoint**: `POST /api/calendar/events`
- **Trigger Condition**: Create calendar schedule event twice with the same `idempotency_key`.
- **Normal Behavior**: Single event created.
- **Intended Vulnerable Behavior**: Generates distinct `CALENDAR-TX-xxx` transactions and duplicate events on the calendar grid.
- **Detection Signal**: Multiple calendar events recorded for matching key.

### Example Request
```http
POST /api/calendar/events
Content-Type: application/json

{
  "title": "YouTube 영상 업로드",
  "date": "2026-10-05",
  "idempotency_key": "CALENDAR-001"
}
```

---

## 8. SEC-358: 멱등성 키 누락 (리포트 필터)

- **Bug ID**: site038-bug08
- **SEC ID**: SEC-358
- **Category**: business-logic
- **Family**: idempotency
- **Type**: 멱등성 키 누락 (리포트 필터)
- **Endpoint**: `POST /api/reports/filter`
- **Trigger Condition**: Save report filter settings repeatedly with the same `idempotency_key`.
- **Normal Behavior**: Existing filter transaction response returned.
- **Intended Vulnerable Behavior**: Server saves multiple filter transactions (`REPORT-TX-001`, `REPORT-TX-002`).
- **Detection Signal**: Multiple `REPORT-TX-xxx` entries for repeated filter application.

### Example Request
```http
POST /api/reports/filter
Content-Type: application/json

{
  "period": "last-30-days",
  "platform": "youtube",
  "metric": "views",
  "idempotency_key": "REPORT-FILTER-001"
}
```

---

## 9. SEC-359: 멱등성 키 누락 (CSV 업로드)

- **Bug ID**: site038-bug09
- **SEC ID**: SEC-359
- **Category**: business-logic
- **Family**: idempotency
- **Type**: 멱등성 키 누락 (CSV 업로드)
- **Endpoint**: `POST /api/import/csv`
- **Trigger Condition**: Perform CSV dataset import twice with the identical `idempotency_key`.
- **Normal Behavior**: Deduplicates file import transaction.
- **Intended Vulnerable Behavior**: Processes import as fresh batch, producing `CSV-TX-001`, `CSV-TX-002` and duplicate import history.
- **Detection Signal**: Multiple `CSV-TX-xxx` entries in ledger.

### Example Request
```http
POST /api/import/csv
Content-Type: application/json

{
  "fileName": "creator-content-data.csv",
  "rows": 120,
  "idempotency_key": "CSV-001"
}
```

---

## 10. SEC-360: 멱등성 키 누락 (API query)

- **Bug ID**: site038-bug10
- **SEC ID**: SEC-360
- **Category**: business-logic
- **Family**: idempotency
- **Type**: 멱등성 키 누락 (API query)
- **Endpoint**: `POST /api/developer/query`
- **Trigger Condition**: Execute query in API Console twice with identical `idempotency_key`.
- **Normal Behavior**: Returns cached query result without appending extra audit transaction.
- **Intended Vulnerable Behavior**: Creates multiple distinct audit entries (`API-QUERY-TX-001`, `API-QUERY-TX-002`).
- **Detection Signal**: Duplicate `API-QUERY-TX-xxx` records for repeating queries.

### Example Request
```http
POST /api/developer/query
Content-Type: application/json

{
  "query": "GET /api/content?platform=youtube",
  "idempotency_key": "API-QUERY-001"
}
```
