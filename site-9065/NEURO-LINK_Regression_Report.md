# NEURO-LINK Regression Report

대상 시스템: NEURO-LINK 실시간 뇌파 분석 리포트 서버  
고정 엔드포인트: `http://localhost:9065`  
목적: PPO 에이전트가 하드웨어 연동 및 배포 단계에서 발생하는 정교한 결함을 관측하고, 회귀 탐지 정책을 학습할 수 있도록 11개 안티패턴을 코드와 리포트에 반영한다.

## 통신 무결성

- Spring Boot API는 `/api/snapshot`, `/api/scenarios`를 제공한다.
- 전역 CORS는 `http://localhost:9065`, `http://127.0.0.1:9065`를 허용한다.
- Vite 설정은 `/api` 프록시를 `http://localhost:9065`로 고정한다.
- Docker Compose는 호스트 `9065`를 컨테이너 `8080`으로 매핑한다.
- 운영형 실행에서는 Spring Boot가 React 정적 빌드를 함께 서빙하므로 브라우저와 API가 동일 오리진 `http://localhost:9065`에서 동작한다.

## 결함 시나리오

### 1. 읽기전용 파일 시스템으로 인한 업데이트 쓰기 실패

- 신호: `EROFS`
- 서브시스템: Updater FS
- 실패 모드: OTA staging 단계에서 `/opt/neuro-link/releases` 쓰기가 거부된다.
- 관측 지표: 업데이트 로그 `updater.fs` ERROR, release manifest 기록 실패.
- 완화 전략: mount state preflight, writable overlay fallback, 배포 전 쓰기 가능성 검사.

### 2. mmap 파일 구조 변경에 따른 메모리 참조 크래시

- 신호: `SIGBUS`
- 서브시스템: Shared Memory
- 실패 모드: producer는 v3 header를 쓰지만 reader는 v2 frame stride를 기준으로 참조한다.
- 관측 지표: mmap bus unstable 상태, segment stride 변경 로그.
- 완화 전략: schema-tagged mmap segment, rolling compatibility reader, mmap version gate.

### 3. 업데이트 바이너리의 실행 권한(+x) 누락

- 신호: `EACCES`
- 서브시스템: Installer
- 실패 모드: 업데이트 후 `neuro-agent.bin` 실행 권한이 없어 launcher가 시작하지 못한다.
- 관측 지표: Update Agent blocked, permission preflight failed.
- 완화 전략: artifact permission verification, promotion 전 `+x` 체크, 패키징 단계 권한 테스트.

### 4. NPU 런타임 라이브러리 버전 불일치 및 연산 지연

- 신호: `ABI_DRIFT`
- 서브시스템: NPU Runtime
- 실패 모드: `libnpu_rt 5.2`가 `5.4` ABI용 compiled graph를 로드한다.
- 관측 지표: latency 상승, NPU degraded 상태, inference queue throttling.
- 완화 전략: runtime ABI lockfile, latency canary, graph/runtime compatibility matrix.

### 5. 업데이트 직후 첫 실행 시 JIT 컴파일 병목 현상

- 신호: `COLD_START`
- 서브시스템: JIT Cache
- 실패 모드: 첫 inference에서 graph specialization이 동기적으로 수행되어 지연이 급증한다.
- 관측 지표: `jit.cache` WARN, cold graph specialization 초과 시간.
- 완화 전략: maintenance window warmup, precompiled graph cache, 첫 실행 전 canary inference.

### 6. 설정 파일 하위 호환성 문제로 인한 무한 롤백 루프

- 신호: `ROLLBACK_LOOP`
- 서브시스템: Config
- 실패 모드: legacy device가 신규 calibration config를 거부하고 반복적으로 이전 버전으로 되돌아간다.
- 관측 지표: 롤백 카운터 증가, 동일 release pair 반복.
- 완화 전략: config migration guard, monotonic rollback counter, 스키마별 기본값 주입.

### 7. 설치 패키지의 압축 알고리즘 버전 미지원 오류

- 신호: `ZSTD_UNSUPPORTED`
- 서브시스템: Package
- 실패 모드: edge installer가 dictionary 기반 압축 스트림을 해제하지 못한다.
- 관측 지표: package unpack 실패, installer capability mismatch.
- 완화 전략: 다운로드 전 compression capability negotiation, 호환 포맷 fallback.

### 8. 심볼릭 링크 교체 시 발생하는 레이스 컨디션

- 신호: `ENOENT_RACE`
- 서브시스템: Release Switch
- 실패 모드: 서비스가 `current` symlink를 해석하는 동안 비원자적 교체가 발생한다.
- 관측 지표: 일시적 ENOENT, release path missing.
- 완화 전략: atomic rename, file descriptor pinning, readiness gate 후 traffic switch.

### 9. HAL 드라이버와 커널 버전 정합성 결여

- 신호: `KABI_MISMATCH`
- 서브시스템: HAL Driver
- 실패 모드: `eeg-hal.ko`가 런타임 커널과 다른 header로 빌드된다.
- 관측 지표: HAL mismatch, `vermagic` check rejection.
- 완화 전략: kernel/HAL compatibility matrix, 배포 전 module load dry-run.

### 10. 저사양 기기용 AI 모델 경량화 패치 적용 실패

- 신호: `QUANT_PATCH_FAIL`
- 서브시스템: Model Patch
- 실패 모드: int8 delta patch가 대상 base tensor를 찾지 못해 적용이 중단된다.
- 관측 지표: model patch high severity, fallback model tier 요구.
- 완화 전략: base model checksum, patch manifest validation, tier별 fallback model.

### 11. OS 보안 시스템(평판 기반)에 의한 실행 차단

- 신호: `REPUTATION_BLOCK`
- 서브시스템: OS Security
- 실패 모드: 신규 바이너리가 평판 점수 전파 전에 quarantine 처리되어 실행되지 않는다.
- 관측 지표: Update Agent blocked, reputation/security event.
- 완화 전략: signed release notarization, staged reputation warmup, 보안 이벤트 수집.

## 코드 반영 위치

- 백엔드 결함 데이터: `backend/src/main/java/lab/neurolink/service/NeuroTelemetryService.java`
- API 컨트롤러: `backend/src/main/java/lab/neurolink/controller/NeuroTelemetryController.java`
- CORS 설정: `backend/src/main/java/lab/neurolink/config/CorsConfig.java`
- Vite 프록시 설정: `frontend/vite.config.ts`
- 대시보드 UI: `frontend/src/main.tsx`, `frontend/src/styles.css`
- 컨테이너 배포: `Dockerfile`, `docker-compose.yml`
