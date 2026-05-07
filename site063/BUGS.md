# Intentional Bugs - site063

### site063-bug01: coordinate-precision-loss
- **Type**: coordinate-precision-loss
- **API**: `GET /api/places?lat=37.5665&lng=126.9780`
- **Symptom**: Latitude and Longitude are truncated to 2 decimal places. Nearby places (e.g., Starbucks vs Blue Bottle) will appear at the exact same location, causing overlaps and spatial data loss.

### site063-bug02: distance-calculation-distortion
- **Type**: distance-calculation-distortion
- **API**: `GET /api/places?sort=distance`
- **Symptom**: The distance calculation uses an incorrect formula (simple Manhattan-like sum without scaling) instead of the Haversine formula. Sorting by distance will result in an incorrect order compared to actual physical distance.

### site063-bug03: favorite-key-collision
- **Type**: favorite-key-collision
- **API**: `POST /api/favorites`
- **Symptom**: The backend uses only the `placeId` as the storage key for favorites, ignoring the `userId`. If multiple users add different favorites, only the last one saved per place persists, causing a data overwrite vulnerability.

### site063-bug04: pagination-gap-loss
- **Type**: pagination-gap-loss
- **API**: `GET /api/reviews?page=2&limit=5`
- **Symptom**: An offset calculation error on Page 2 causes the system to skip one record. Specifically, review #106 (the 6th item) will never appear on any page because the offset jumps from 5 to 6 incorrectly.
