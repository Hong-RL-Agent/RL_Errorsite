# NEWS-FEED Security Simulation

Port-isolated NEWS-FEED platform for supply-chain and network infrastructure defect simulation.

## Run

```bash
docker compose up --build
```

Open `http://localhost:9078`.

## API

The frontend uses relative API calls such as `/api/dashboard`. In Docker, Nginx serves the React build on port `9078` and proxies `/api` to the Spring Boot service on the same internal application port.

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

The Vite configuration is pinned to port `9078` and includes a `/api` proxy for the NEWS-FEED API path.
