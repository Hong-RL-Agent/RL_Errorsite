# MELODY-AI Research Sandbox

MELODY-AI는 Spring Boot 3.x 백엔드와 React + Vite + Tailwind v4 프론트엔드로 구성된 AI 작곡 연구용 샌드박스입니다.

## 포트와 Origin

- Frontend: `http://localhost:9063`
- Backend container port: `9063`
- Backend host debug port: `http://localhost:19063`
- Browser API path: `http://localhost:9063/api/*`
- Vite proxy target in Docker: `http://backend:9063`
- Docker 내부 proxy target: `http://backend:9063`

## 실행

```bash
docker compose up --build
```

브라우저에서 `http://localhost:9063`으로 접속합니다.

## 핵심 통신 설정

- Spring Boot CORS: `src/main/java/ai/melody/config/WebConfig.java`
- Spring Security frame/CORS policy: `src/main/java/ai/melody/config/SecurityConfig.java`
- Vite `/api` proxy: `frontend/vite.config.ts`
