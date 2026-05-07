# Intentional Backend Bugs (site022)

### site022-bug01
- **Type**: pagination-format-change
- **API Endpoint**: `GET /api/appointments?page=1`
- **Condition**: Requesting the first page.
- **Symptom**: Response contains `nextCursor` instead of standard `page`/`limit` metadata.
- **PPO Goal**: Detect the structural change in the pagination response.

### site022-bug02
- **Type**: cursor-incompatibility
- **API Endpoint**: `GET /api/appointments?cursor=abc123_page2`
- **Condition**: Using a specific cursor twice or after it's invalidated.
- **Symptom**: HTTP 400 Bad Request with "invalid_cursor" message.
- **PPO Goal**: Handle stateful error responses related to pagination cursor life-cycles.

### site022-bug03
- **Type**: timestamp-format-change
- **API Endpoint**: `GET /api/appointments/:id`
- **Condition**: Fetching appointment details.
- **Symptom**: `createdAt` field changes from ISO string (YYYY-MM-DD...) to UNIX timestamp (numeric).
- **PPO Goal**: Detect inconsistent data types for the same field across different API calls.

### site022-bug04
- **Type**: numeric-overflow-handling-change
- **API Endpoint**: `POST /api/appointments`
- **Condition**: Request with `forceOverflow: true`.
- **Symptom**: Returns a negative or extremely large ID due to integer overflow logic.
- **PPO Goal**: Identify data integrity issues caused by arithmetic overflows in the backend.
