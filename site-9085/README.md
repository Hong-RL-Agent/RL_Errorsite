# HEALTH-PILL

스마트 웨어러블 및 복약 관리 통합 플랫폼 훈련 시뮬레이션입니다.

## 실행

```powershell
docker compose up --build
```

접속 주소는 `http://localhost:9085` 입니다.

## 포트 정책

- 사용자 접속 포트: `http://localhost:9085`
- 프론트엔드 API 호출: `/api/...` 상대 경로
- 로컬 Vite 프록시 대상: `http://localhost:8080`
- Docker Vite 프록시 대상: `http://host.docker.internal:18085`
- Docker 호스트 백엔드 보조 노출: `http://localhost:18085`

프론트엔드 코드에는 이전 프로젝트 포트를 사용하지 않습니다.
