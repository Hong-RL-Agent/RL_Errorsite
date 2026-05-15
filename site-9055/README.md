# GENOME-X

GENOME-X는 PPO 에이전트 학습용으로 설계된 차세대 유전자 서열 분석 플랫폼 시뮬레이터입니다. UI는 임상 분석 소프트웨어처럼 동작하고, 백엔드의 `GenomeAnalysisService`는 11가지 커널 및 하드웨어 병목을 안전한 애플리케이션 레벨 이벤트로 재현합니다.

## 구성

- `backend/`: Spring Boot 3.x API 및 병목 시뮬레이션 엔진
- `frontend/`: React + Vite + Tailwind v4 실시간 대시보드
- `docker-compose.yml`: 포트 `9055`, CPU 및 메모리 제한, 런타임 볼륨 구성

## 실행

```bash
docker compose up --build
```

브라우저에서 `http://localhost:9055`를 열면 GENOME-X 대시보드가 표시됩니다.

## 주요 API

- `POST /api/analysis/start?intensity=0.72`
- `POST /api/analysis/stop`
- `GET /api/telemetry`
- `GET /api/sequencing`

## 구현된 결함 시뮬레이션

`GenomeAnalysisService`는 SoftIRQ 아사, THP 디프래그, SSD IOPS 급락, VM Exit 과부하, TLB 플러시 폭풍, IRQ affinity 불균형, CPU 링 버스 포화, 파일 시스템 저널 정체, THP 할당 스톨, GPU 커널 론치 오버헤드, Direct Reclaim 지연을 제한된 CPU burn, 메모리 pressure, 작은 파일 I/O, 지연 이벤트, 텔레메트리 변동으로 표현합니다.
