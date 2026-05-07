# Intentional Backend Bugs (site023)

### site023-bug01
- **Type**: schema-isolation-failure
- **API Endpoint**: `GET /api/tournaments?leagueId=alpha`
- **Condition**: Requesting tournaments for a specific league.
- **Symptom**: Response contains data from all leagues (Beta, Gamma) instead of just Alpha.
- **PPO Goal**: Detect data isolation failure in a multi-tenant/multi-league environment.

### site023-bug02
- **Type**: tenant-filter-missing-query
- **API Endpoint**: `GET /api/teams`
- **Condition**: General team registry fetch.
- **Symptom**: Returns all teams in the system without applying the active tenant/league filter.
- **PPO Goal**: Identify missing filtering logic that leads to excessive data exposure.

### site023-bug03
- **Type**: join-data-leak
- **API Endpoint**: `GET /api/matches/:id`
- **Condition**: Fetching specific match details.
- **Symptom**: `relatedMatches` array includes a match from a completely different tournament.
- **PPO Goal**: Detect improper data joining or relationship mapping that leaks unrelated records.

### site023-bug04
- **Type**: index-mixing-inconsistency
- **API Endpoint**: `GET /api/brackets`
- **Condition**: Fetching the tournament bracket layout.
- **Symptom**: Round order is non-linear (e.g., Finals shown before Round of 16).
- **PPO Goal**: Detect data sorting inconsistencies or index corruption in structural responses.
