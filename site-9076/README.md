# SKY-TAXI Control Dashboard

UAM 자율 비행 택시 관제 및 보안 취약점 훈련 시뮬레이션입니다. 모든 로컬 통신 기준 포트는 `http://localhost:9076`입니다.

## 구조

- `backend`: Spring Boot 3.x API
- `frontend`: React + Vite + Tailwind v4 관제 대시보드
- `docker-compose.yml`: 9076 포트 고정 실행 구성. Docker에서는 Spring Boot가 빌드된 프론트엔드와 API를 같은 포트에서 제공합니다.
- `SKY-TAXI_Security_Report.md`: 의도적 취약점 11종 설명

## 실행

```bash
docker compose up --build
```

접속:

```text
http://localhost:9076
```

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
npm run dev
```

포트 격리를 최우선으로 검증할 때는 Docker 실행을 권장합니다. Docker 구성은 Spring Boot가 빌드된 React 앱과 `/api`를 같은 `http://localhost:9076`에서 제공합니다.

프론트엔드는 `/api/...` 상대 경로만 호출하며, Vite 프록시는 `http://localhost:9076`으로 고정되어 있습니다.
