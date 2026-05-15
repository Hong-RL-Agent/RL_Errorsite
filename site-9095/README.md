# DEEP-SEA-DATA

해저 데이터 센터 관제 서버 시뮬레이터입니다. 모든 런타임 접근은 `http://localhost:9095` 기준으로 격리되어 있습니다.

## 구조

- `backend`: Spring Boot 3.x API 서버
- `frontend`: React + Vite + Tailwind CSS v4 관제 UI
- `docker-compose.yml`: 9095 포트 단일 진입점 구성
- `DEEP-SEA-DATA_Stability_Report.md`: 11개 가용성 결함 패턴 분석 리포트

## 실행

```bash
docker compose up --build
```

접속: `http://localhost:9095`

## 개발 실행

백엔드:

```bash
cd backend
mvn spring-boot:run
```

프론트엔드:

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

통합 실행은 Docker Compose를 권장합니다. 프론트 개발 서버도 `http://localhost:9095`에서 동작하며 `/api` 요청은 Spring Boot 백엔드로 프록시됩니다. 운영형 확인은 `docker compose up --build`로 단일 9095 진입점에서 실행합니다.
