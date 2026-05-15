# WASTE-MGMT Smart City Console

WASTE-MGMT는 `http://localhost:9097` 단일 기준 주소로 동작하도록 구성된 스마트 폐기물 관리 및 네트워크 관제 시뮬레이터입니다.

## 구성

- Backend: Spring Boot 3.x, 내부 포트 `9097`, `/api/**`
- Frontend: React + Vite + Tailwind v4
- Runtime: Docker Compose, 외부 노출 포트 `9097:9097`
- API 호출: 프론트엔드에서 모두 상대 경로(`/api/...`) 사용
- Proxy: Vite 개발 프록시와 Nginx 운영 프록시 모두 `/api` 라우팅 포함

## 실행

```bash
docker compose up --build
```

접속 주소:

```text
http://localhost:9097
```

## 로컬 개발 참고

백엔드를 단독 실행하면 Spring Boot는 `9097`에서 시작합니다.

```bash
cd backend
mvn spring-boot:run
```

프론트 개발 서버도 기본값은 `9097`입니다. 같은 머신에서 백엔드와 동시에 개발 서버를 띄울 때는 `WM_BACKEND_ORIGIN`으로 백엔드 원점을 분리한 별도 실행 전략이 필요합니다. 운영 Compose에서는 외부 포트를 하나만 사용하므로 충돌이 없습니다.
