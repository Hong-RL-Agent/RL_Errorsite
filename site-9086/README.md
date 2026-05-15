# COSMIC-REPAIR

Isolated frontend performance and UI defect simulation for port `9086`.

## Run

```powershell
docker compose up --build
```

Open:

```text
http://localhost:9086
```

Frontend API calls use relative `/api/...` paths. The compose network keeps the Spring Boot service internal while exposing only `9086` to the host.
