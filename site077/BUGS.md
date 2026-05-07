# Intentional Backend Vulnerabilities - site077

This document lists the intentional bugs implemented for PPO reinforcement learning training.

| Bug ID | Type | Endpoint | Description | Expected Symptom |
|---|---|---|---|---|
| `site077-bug01` | file-extension-content-mismatch | `POST /api/upload` | .jpg upload reports content mismatch. | Error banner with bugId. |
| `site077-bug02` | metadata-stripping-loss | `GET /api/images/:id` | Metadata stripped for IDs 1 and 3. | Missing EXIF info in modal. |
| `site077-bug03` | aspect-ratio-distortion | `GET /api/images` | Width/Height ratio ignored for even IDs. | Stretched/squashed thumbnails. |
| `site077-bug04` | tag-extraction-pipeline-skip | `GET /api/images` | Tag analysis skipped for ID 5. | Empty tag list for cat image. |
