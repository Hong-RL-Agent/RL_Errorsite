# HOLO-COMM Regression Report

대상 시스템: HOLO-COMM 3D 홀로그램 회의 관제 서버  
고정 진입점: `http://localhost:9066`  
API 정책: 프론트엔드는 상대 경로 `/api/...`만 사용하며, Spring Boot 백엔드는 `http://localhost:9066` Origin을 전역 CORS로 허용한다.

## 회귀 시나리오 매트릭스

| ID | 결함 시나리오 | 트리거 | PPO 관측 신호 | 기대 완화 정책 |
|---:|---|---|---|---|
| 1 | 설치 후 환경변수 섀도잉에 의한 구버전 엔진 실행 오류 | `PATH`에서 `legacy/bin`이 신규 엔진보다 먼저 탐색됨 | `engine_version_mismatch` | 설치 직후 환경변수 정규화, 서명된 런처 절대 경로 고정 |
| 2 | OS 스마트 앱 컨트롤 Reputation에 의한 바이너리 실행 차단 | 평판 미등록 업데이트 바이너리 실행 | `binary_reputation_block` | 코드 서명, 배포 평판 워밍, 차단 큐 재시도 |
| 3 | 동적 라이브러리 Search Path 우선순위 혼선으로 인한 라이브러리 충돌 | 작업 디렉터리 DLL이 vendor DLL보다 우선 로드됨 | `library_shadow_collision` | 절대 경로 로딩, DLL 해시 검증, search path 최소화 |
| 4 | NPU 가속기 컴파일러와 런타임 버전 불일치로 인한 하드웨어 가속 실패 | compiler 2.9 산출물을 runtime 2.6에서 실행 | `npu_runtime_drift` | 컴파일러-런타임 호환성 매트릭스 게이트 |
| 5 | 델타 패치 적용 시 원본 바이너리 손상에 의한 업데이트 오류 | base hash 불일치 상태에서 delta patch 적용 | `delta_patch_corrupt_base` | 패치 전 원본 해시 검증, 전체 패키지 폴백 |
| 6 | 실시간 모델 교체 시 GPU 메모리 파편화 및 할당 실패 | 모델 언로드 직후 대형 텐서 재할당 | `gpu_fragmentation_oom` | VRAM 풀 압축, 교체 윈도우 제한, 사전 할당 검증 |
| 7 | 업데이트 바이너리의 네트워크 격리 Sandbox 정책 충돌 | 업데이트 프로세스가 egress deny 정책으로 CDN 접근 실패 | `sandbox_egress_denied` | 업데이트 전용 정책 라벨, 사내 프록시 경유 |
| 8 | 업데이트 후 남겨진 임시 파일들의 GC 실패 및 디스크 점유 | `.holo-tmp` 파일 핸들이 해제되지 않음 | `temp_gc_leak` | 세션별 임시 디렉터리, 종료 훅, TTL 정리 작업 |
| 9 | 모델 교체 후 해제되지 않은 VRAM 좀비 점유 현상 | 렌더 그래프 참조가 남아 VRAM dispose 실패 | `zombie_vram_retention` | 참조 카운트 추적, 강제 dispose, 누수 예산 경보 |
| 10 | OS 보안 정책 App Translocation에 의한 리소스 경로 단절 | 격리 실행 경로에서 상대 리소스 탐색 | `translocated_resource_missing` | 앱 번들 기준 resource resolver 사용 |
| 11 | 설치 패키지의 Zstandard 압축 알고리즘 하위 호환성 결여 | zstd v1.5 dictionary 패키지를 v1.4 클라이언트가 해제 | `zstd_backward_incompat` | 압축 feature flag, 최소 버전 협상, gzip 폴백 |

## 구현 연결

- `GET /api/status`: 포트 기준 URL, 렌더러 버전, CORS 정책 상태를 반환한다.
- `GET /api/telemetry`: 참여자 A/V 지연, VRAM 점유율, 파편화, 좀비 점유, NPU drift, 차단된 업데이트 작업 수를 동적으로 생성한다.
- `GET /api/scenarios`: 위 11개 결함 시나리오를 PPO 학습 신호와 함께 반환한다.
- `GET /api/logs`: 업데이트 차단, 패치 실패, VRAM 파편화 등 터미널 로그를 반환한다.

## 회귀 판정 기준

1. 브라우저는 `http://localhost:9066`으로만 접근한다.
2. 프론트엔드 코드의 API 호출은 `/api/...` 상대 경로만 사용한다.
3. Vite 개발 서버는 `/api`를 백엔드로 프록시한다.
4. Spring Boot CORS는 `http://localhost:9066` 및 `http://127.0.0.1:9066` Origin을 허용한다.
5. 결함 시나리오 11개가 UI와 API에 모두 노출된다.
