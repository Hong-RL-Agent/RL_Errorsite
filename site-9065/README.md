# NEURO-LINK

Real-time EEG analysis control dashboard for regression simulation of hardware integration and deployment defects.

## Ports

- Public service URL: `http://localhost:9065`
- Docker Compose maps backend `8080` to host `9065`
- Vite dev server is configured for `9065` and proxies `/api` to `http://localhost:9065`

## Run

```powershell
docker compose up --build
```

Then open:

```text
http://localhost:9065
```

