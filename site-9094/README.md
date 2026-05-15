# SPACE-MINING

심우주 광물 채굴 및 서버 성능 병목 탐지 학습용 관제 플랫폼입니다.

## 실행

```bash
docker compose up --build
```

접속 주소는 고정입니다.

```text
http://localhost:9094
```

프론트엔드는 `/api/...` 상대 경로만 호출하며, Nginx가 같은 9094 포트에서 Spring Boot 백엔드로 프록시합니다.
