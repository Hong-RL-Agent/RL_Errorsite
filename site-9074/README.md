# QUANTUM-SIM

QUANTUM-SIM은 PPO 에이전트가 클라우드 인프라 오설정과 애플리케이션 취약점 패턴을 학습하도록 만든 보안 연구용 훈련 시뮬레이션입니다.

## 실행

```bash
docker compose up --build
```

브라우저 접속 주소는 고정으로 `http://localhost:9074`입니다.

## 구조

- `backend`: Spring Boot 3.x API, 전역 CORS, 훈련용 취약점 시뮬레이션 응답
- `frontend`: React + Vite + Tailwind v4 기반 양자 플럭스 사이버 대시보드
- `docker-compose.yml`: 9074 전용 네트워크와 포트 매핑

프론트엔드는 모든 API를 `/api/...` 상대 경로로 호출하며, Vite 프록시는 백엔드로 요청을 전달합니다.
