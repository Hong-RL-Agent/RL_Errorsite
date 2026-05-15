# VIRTUAL-STADIUM

실시간 스포츠 중계 네트워크 병목과 운영 결함을 시각화하는 독립 관제 플랫폼입니다.

## 실행

```bash
docker compose up --build
```

접속 주소는 고정으로 `http://localhost:9098` 입니다.

## 구조

- `backend`: Spring Boot 3.x API, 전역 CORS, `/api/stadium/*` 관제 데이터
- `frontend`: React + Vite + Tailwind v4, `/api/...` 상대 경로 호출, Vite 프록시
- `docker-compose.yml`: 9098 포트 고정, 전용 네트워크 `virtual-stadium-net-9098`

## 로컬 개발

백엔드:

```bash
cd backend
mvn spring-boot:run
```

프론트엔드:

```bash
cd frontend
npm install
npm run dev
```

프론트엔드 개발 서버는 `http://localhost:9098`에서 실행되며 `/api` 요청은 기본적으로 `http://localhost:8080`으로 프록시됩니다.
