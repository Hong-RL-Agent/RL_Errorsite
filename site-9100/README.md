# TRAFFIC-CONTROL

지능형 교통 신호 제어 관제 플랫폼 샘플입니다. 모든 런타임 진입점은 `http://localhost:9100` 기준으로 격리되어 있습니다.

## 실행

```powershell
docker compose up --build
```

접속 주소는 `http://localhost:9100`입니다. Compose 환경에서는 프론트엔드 Nginx가 9100을 단독으로 노출하고 `/api`를 내부 Spring Boot API로 프록시합니다.

또는 개발 모드:

```powershell
docker compose up traffic-control-db
```

별도 터미널에서:

```powershell
cd backend
$env:SERVER_PORT=8080
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:55432/traffic_control"
mvn spring-boot:run
```

```powershell
cd frontend
npm install
npm run dev
```

프론트엔드 개발 서버는 `http://localhost:9100`에서 실행되며 `/api` 요청은 Spring Boot로 프록시됩니다.
