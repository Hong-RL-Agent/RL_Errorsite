# BIO-PAY Secure Payment Console

BIO-PAY 생체 인증 결제 관리 대시보드입니다. Spring Boot 3.x 백엔드가 `http://localhost:9064`에서 API와 정적 React 앱을 함께 제공합니다.

## 실행

```bash
docker compose up --build
```

접속 URL:

```text
http://localhost:9064
```

## 개발 모드

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

Vite 개발 서버는 `http://localhost:5173`에서 열리며, `/api` 요청은 `http://localhost:9064`로 프록시됩니다. 배포 모드에서는 Spring Boot가 같은 `9064` 포트에서 프론트엔드와 API를 모두 처리합니다.
