# site089 - Intentional Backend Logic Bugs

The following bugs are intentionally embedded for PPO agent training:

| Bug ID | Type | Description | Trigger |
| :--- | :--- | :--- | :--- |
| **site089-bug01** | cache-invalidation-missed | Updated news doesn't reflect in the public feed because the cache wasn't cleared. | POST /update -> GET /news |
| **site089-bug02** | cache-key-collision | Different category requests return the same data because they share a generic cache key. | GET /news?cat=IT vs Sports |
| **site089-bug03** | partial-update-missing | Only the first few items in the cache are refreshed during an update event. | POST /update |
| **site089-bug04** | cache-source-inconsistency | The cached response data contains values that do not match the underlying source database. | GET /news vs GET /source |
