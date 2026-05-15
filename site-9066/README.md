# HOLO-COMM Control Server

HOLO-COMM은 3D 홀로그램 회의 관제 시뮬레이션 앱입니다. 브라우저 진입점은 항상 `http://localhost:9066`이며, 프론트엔드는 상대 경로 `/api/...`만 호출합니다.

## 구조

- `backend/`: Spring Boot 3.x API 서버, 내부 포트 `8080`
- `frontend/`: React + Vite + Tailwind v4 관제 콘솔, 외부 포트 `9066`
- `docker-compose.yml`: `http://localhost:9066` 단일 진입점과 `/api` 프록시 구성
- `HOLO-COMM_Regression_Report.md`: PPO 학습용 결함 시나리오 회귀 보고서

## 실행

```bash
docker compose up --build
```

접속 주소:

```text
http://localhost:9066
```

로컬 개발 시에는 백엔드를 `8080`, 프론트엔드를 `9066`에서 실행하면 `frontend/vite.config.ts`의 `/api` 프록시가 자동으로 백엔드에 연결됩니다.
