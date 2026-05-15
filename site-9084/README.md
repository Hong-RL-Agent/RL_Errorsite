# DIGITAL-HERITAGE

디지털 유산 보존 관제와 BCP 취약점 훈련을 위한 Spring Boot 3.x + React/Vite/Tailwind v4 시뮬레이션 플랫폼입니다.

## Port Isolation

- Public URL: `http://localhost:9084`
- Frontend API calls: relative path only, for example `/api/heritage/dashboard`
- Spring Boot backend: port `9084`
- Docker Compose: frontend nginx publishes `9084:9084`, backend stays inside the isolated `digital-heritage-9084` network

## Run

```bash
docker compose up --build
```

브라우저에서 `http://localhost:9084`를 열면 DIGITAL-HERITAGE 관제 화면을 볼 수 있습니다.

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

개발 모드에서도 프론트엔드는 `/api/...` 상대 경로를 사용합니다.
