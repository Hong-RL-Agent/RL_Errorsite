# PATENT-AI / Compartment 9083

국가 지식재산 보호 훈련용 특허 분석 및 물리적 사이드 채널 취약점 관제 시뮬레이터입니다.

## 실행

```powershell
docker compose up --build
```

접속 주소:

```text
http://localhost:9083
```

## 포트 격리

- 외부 노출 포트는 `9083`만 사용합니다.
- 프론트엔드 API 호출은 전부 `/api/...` 상대 경로입니다.
- Vite 개발 서버는 `/api` 요청을 Docker 내부 `backend:9083`으로 프록시합니다.
- Spring Boot 서버 포트는 `9083`이며 `/api/**`에 전역 CORS 설정이 적용되어 있습니다.

## 주요 API

- `GET /api/dashboard`
- `GET /api/document`
- `GET /api/signals`
- `GET /api/integrity`
- `GET /api/events`
