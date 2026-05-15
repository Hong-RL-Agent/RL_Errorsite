# BIO-PAY Regression Report

대상 시스템: BIO-PAY 생체 인증 결제 관리 대시보드  
고정 포트: `http://localhost:9064`  
목적: PPO 에이전트가 설치 및 배포 단계의 결함 신호를 학습할 수 있도록, 외관상 견고한 핀테크 보안 콘솔 내부에 복잡한 업데이트 안티패턴을 시뮬레이션한다.

## 통신 무결성

- Spring Boot 서버 포트는 `9064`로 고정했다.
- 전역 CORS는 `localhost:9064`, `127.0.0.1:9064`, Vite 개발 서버 `localhost:5173`, `127.0.0.1:5173`을 허용한다.
- Vite `server.proxy`는 `/api`를 `http://localhost:9064`로 전달한다.
- 프론트엔드는 API를 절대 외부 포트로 직접 참조하지 않고 `/api/dashboard`, `/api/defects` 상대 경로만 사용한다.

## 결함 시뮬레이션 목록

| ID | 결함 | 단계 | 심각도 | 관측 신호 | 내재 안티패턴 |
|---:|---|---|---|---|---|
| 1 | 콜드 부트 실패를 동반한 설정값 오염 | bootstrap | critical | `config.seed`가 재시작 후 null profile을 주입 | 초기 설정과 런타임 보정값을 같은 mutable store에 저장 |
| 2 | 델타 업데이트 바이너리 체크섬 불일치 | delta-patch | high | manifest SHA-256과 patch blob digest 불일치 | 부분 다운로드를 성공 상태로 캐싱 |
| 3 | 업데이트 중 롤백 실패 시나리오 | rollback | critical | rollback marker는 있으나 이전 bundle pointer 소실 | 원자적 스왑 없이 활성 경로를 먼저 갱신 |
| 4 | 온디바이스 AI 모델 가중치 데이터 손상 | model-sync | high | face-liveness 모델 tensor shape mismatch | 모델 파일과 메타데이터를 독립 커밋 |
| 5 | 설치 중 임시 디렉터리(`/tmp`) 할당량 초과 | install | medium | staging free space가 2% 미만 | 임시 파일 정리 없이 압축 해제를 반복 |
| 6 | 보안 라이브러리 심볼릭 링크 순환 참조 | linker | high | `libbiosec.so` 링크가 순환 | 심볼릭 링크 검증을 depth 제한 없이 수행 |
| 7 | 사용자 디스크 쿼타 초과에 따른 침묵하는 설치 실패 | install | medium | exit code 0이지만 artifact size 0 bytes | quota 예외를 warning 로그로만 처리 |
| 8 | 가상화 샌드박스 내 구버전 라이브러리 섀도잉 | sandbox | high | sandbox 경로가 crypto provider 1.1.1을 우선 로드 | 컨테이너 경로가 호스트 보안 라이브러리보다 우선 |
| 9 | 환경 변수 길이 제한에 따른 경로 누락 | environment | medium | `BIOPAY_PLUGIN_PATH` tail segment truncation | 긴 경로를 단일 env var에 누적 |
| 10 | 무결성 자가 치유 로직의 무한 루프 | self-heal | critical | supervisor fork마다 repair counter 초기화 | 복구 상태를 프로세스 메모리에만 저장 |
| 11 | 서명 만료 및 로컬 시간 불일치 오판 | signature | high | device local time +19h로 유효 서명 거부 | NTP 신뢰도 확인 전 인증서 만료 판정 |

## 코드 반영 지점

- `backend/src/main/java/com/biopay/service/DashboardService.java`: 11개 결함을 API 응답 데이터로 노출한다.
- `backend/src/main/java/com/biopay/controller/DashboardController.java`: `/api/dashboard`, `/api/defects`, `/api/defects/{id}/probe` 엔드포인트를 제공한다.
- `backend/src/main/java/com/biopay/model/FaultProbe.java`: 각 결함의 관측 이벤트, 시뮬레이션 원인, 가드레일을 구조화한다.
- `frontend/src/main.tsx`: 결함 카드, 설치 진행률, 인벤토리, 생체 스캔 애니메이션, 성공률 차트를 렌더링한다.
- `frontend/vite.config.ts`: `/api` 프록시를 `http://localhost:9064`로 고정한다.
- `docker-compose.yml`: 호스트와 컨테이너 포트를 `9064:9064`로 명시한다.

## 학습용 기대 관측값

- UI는 정상적인 금융 보안 대시보드처럼 보인다.
- 설치 및 업데이트 상태는 부분 성공, 격리, 차단, 재시도 신호를 섞어 표시한다.
- 각 결함은 단일 장애가 아니라 설치 상태, 무결성 검증, 롤백, 모델 동기화, 런타임 경로 해석이 상호작용하는 형태로 노출된다.
- PPO 에이전트는 표면 지표가 안정적일 때도 내부 업데이트 체인이 실패할 수 있음을 관측할 수 있다.
