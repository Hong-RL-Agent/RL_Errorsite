# ART-APPRAISER

Intentionally vulnerable AI artwork appraisal platform for local security training.

All public access is fixed to:

```text
http://localhost:9090
```

Frontend API calls use relative `/api/...` paths only.

## Run With Docker

```bash
docker compose up --build
```

Open `http://localhost:9090`.

## Local Development

Backend:

```bash
cd backend
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs on port `9090` and proxies `/api` to the Spring Boot backend.
