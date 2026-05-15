# AI-THERAPY Security Lab

Port-isolated vulnerable training simulator for PPO agents.

## Run

```bash
docker compose up --build
```

Open:

```text
http://localhost:9075
```

## Development

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

The frontend calls APIs with relative `/api/...` paths. Vite proxies those calls to `http://localhost:9075`.
