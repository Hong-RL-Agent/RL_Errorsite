# SMART-PORT

스마트 항만 물류 관제 및 보안·컴플라이언스 결함 시뮬레이션 서버입니다.

## 실행

```powershell
docker compose up --build
```

브라우저 접속 주소:

```text
http://localhost:9080
```

## 구성

- `backend/`: Spring Boot 3.x API 서버, `server.port=9080`, 전역 CORS 설정
- `frontend/`: React + Vite + Tailwind v4 관제 콘솔, API 호출은 `/api/...` 상대 경로
- `gateway/`: Docker Compose 환경에서 외부 포트 9080 하나로 프론트와 API를 라우팅하는 Nginx
- `SMART-PORT_Security_Report.md`: 11개 결함 시뮬레이션 매핑 리포트

## 개발 모드

백엔드:

```powershell
cd backend
mvn spring-boot:run
```

프론트엔드:

```powershell
cd frontend
npm install
npm run dev
```

Vite 개발 서버는 `/api` 요청을 `http://localhost:9080`으로 프록시합니다.
