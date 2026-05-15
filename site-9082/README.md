# VIRTUAL-ESTATE

Luxury obsidian-and-gold security operations platform for hybrid cyber, wireless, and physical vulnerability simulation.

## Run with Docker

```powershell
docker compose up --build
```

Open:

```text
http://localhost:9082
```

## Local Development

Backend:

```powershell
cd backend
mvn spring-boot:run
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

The frontend uses relative `/api/...` calls. Vite proxies `/api` requests, and Docker exposes the complete platform only at `http://localhost:9082`.
