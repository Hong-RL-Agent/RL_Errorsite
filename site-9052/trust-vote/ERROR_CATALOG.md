# TRUST-VOTE 포함 오류 카탈로그

이 문서는 TRUST-VOTE 웹사이트와 백엔드 시뮬레이터에 의도적으로 포함된 시스템성 오류를 정리한다. 목적은 PPO 에이전트가 보안 투표 시스템의 심층 하드웨어, 커널, 동기화, 저장장치 회귀를 관찰하고 탐지하도록 학습시키는 것이다.

## 오류 요약

| ID | 오류명 | 하위 시스템 | 사용자에게 보이는 현상 | 구현 위치 |
| --- | --- | --- | --- | --- |
| R01 | TLB Shootdown | 메모리 매핑 | 새 투표 처리 시 항상 100ms 지연 | `BlockchainSimService.castVote()` |
| R02 | Lock Convoy | 동기화 | 전역 mutex 대기열 때문에 투표 처리량 저하 | `runLockConvoy()` |
| R03 | GPU Implicit Sync Bottleneck | GPU/렌더링 | 암호화 시각화가 순간적으로 끊김 | `runGpuImplicitSync()`, 프론트 `encryption-core.stalled` |
| R04 | Storage Writeback Error Masking | 저장장치 | 투표 로그 성공 후 2초 뒤 내부 오류가 늦게 표시 | `scheduleMaskedWritebackError()` |
| R05 | GPU Instruction Cache Thrashing | GPU 검증 | Tally Verification 트리거 시 검증 지연 5배 | `verifyTallyWithShaderThrash()` |
| R06 | CPU Core Pinning Interrupt Imbalance | 커널/스케줄링 | 프로세스 Core 0, 인터럽트 Core 1 모델로 cross-core 지연 | `runInterruptImbalance()`, `docker-compose.yml` |
| R07 | ECC Memory Correction Latency | 메모리 오류 보정 | 50번째 요청마다 300ms 추가 지연 | `castVote()` 요청 카운터 |
| R08 | SSD Internal Garbage Collection Delay | SSD/I/O | Batch Delete 실행 시 5초 I/O freeze | `batchDeleteOldSessions()` |
| R09 | NUMA Hop Distance Latency | NUMA 메모리 | local 50ms, remote 200ms 데이터 접근 지연 | `runNumaHop()` |
| R10 | Memory Compaction Livelock | 커널 메모리 관리 | huge page 할당 livelock 상태가 8초간 유지 | `triggerRegression(10)` |
| R11 | Journal Mirroring Bandwidth Halving | DB 저널/스토리지 | safety mirroring 시 쓰기 대역폭 절반으로 감소 | `writeJournal()`, `triggerRegression(11)` |

## 상세 오류 설명

### R01. TLB Shootdown

새 투표가 처리될 때마다 모든 CPU 코어의 Translation Lookaside Buffer 무효화 비용을 흉내 내기 위해 100ms 지연을 삽입한다.

- 발생 조건: `New Vote` 요청마다 자동 발생
- 관찰 지표: `Security Status`, `Subsystem Latency`, 투표 receipt latency
- 기대 증상: 정상 투표인데도 최소 latency floor가 상승

### R02. Lock Convoy

공정한 전역 mutex 하나에 여러 작업을 밀어 넣어, 높은 우선순위 투표 처리도 앞선 긴 대기열 뒤에 묶이는 convoy effect를 만든다.

- 발생 조건: `New Vote` 요청마다 자동 발생
- 관찰 지표: 평균 지연, 처리량 저하
- 기대 증상: 요청 수가 늘수록 throughput 대비 latency가 비정상 증가

### R03. GPU Implicit Sync Bottleneck

투표 암호화 시각화에서 CPU가 GPU background fence를 기다리는 상황을 시뮬레이션한다. 프론트엔드는 이 상태를 `stalled` 애니메이션으로 표시한다.

- 발생 조건: `New Vote` 요청 또는 R03 수동 트리거
- 관찰 지표: `GPU Fence` 상태, 암호화 시각화 stutter
- 기대 증상: 암호화 코어 애니메이션이 순간적으로 끊기거나 진동

### R04. Storage Writeback Error Masking

Vote Logger가 먼저 성공을 반환한 뒤, 2초 후 디스크 컨트롤러 오류가 ledger feed에 뒤늦게 노출된다.

- 발생 조건: `New Vote` 요청마다 writeback pending 예약
- 관찰 지표: `Writeback Mask`, ledger의 `WRITEBACK-ERROR-SURFACED`
- 기대 증상: 실패 시점과 보고 시점이 어긋남

### R05. GPU Instruction Cache Thrashing

Tally Verification shader가 너무 커서 instruction cache miss가 지속되는 상황을 모델링한다.

- 발생 조건: Regression Matrix에서 R05 클릭
- 관찰 지표: R05 상태 `I-CACHE THRASH`, penalty 2500ms
- 기대 증상: 검증 작업이 평소보다 5배 느리게 관찰됨

### R06. CPU Core Pinning Interrupt Imbalance

Docker Compose는 백엔드 프로세스를 Core 0에 고정하고, 애플리케이션 설정은 네트워크 인터럽트가 Core 1에 몰린 모델을 사용한다.

- 발생 조건: `SIM_PROCESS_CORE=0`, `SIM_NETWORK_INTERRUPT_CORE=1`
- 관찰 지표: R06 상태 `CROSS-CORE IRQ`
- 기대 증상: cross-core 통신 비용으로 120ms 추가 지연

### R07. ECC Memory Correction Latency

50번째 요청마다 ECC multi-bit correction 이벤트를 발생시켜 300ms 추가 latency를 삽입한다.

- 발생 조건: 전체 투표 요청 카운터가 50의 배수
- 관찰 지표: 평균 지연 spike, R07 상태 `ECC CORRECTED`
- 기대 증상: 주기적 long-tail latency

### R08. SSD Internal Garbage Collection Delay

오래된 세션 데이터를 batch delete할 때 SSD 내부 garbage collection steady-state drop을 흉내 내기 위해 5초 freeze를 발생시킨다.

- 발생 조건: `Batch Delete` 버튼 클릭
- 관찰 지표: R08 상태 `I/O FROZEN`
- 기대 증상: UI 명령 응답이 5초 지연

### R09. NUMA Hop Distance Latency

Voting Data가 local NUMA node에 있으면 50ms, remote node에 있으면 200ms 지연을 추가한다.

- 발생 조건: UI의 `NUMA local/remote` 토글 후 `New Vote`
- 관찰 지표: `numaHop` latency, receipt regressionsApplied
- 기대 증상: remote 선택 시 local보다 150ms 더 느림

### R10. Memory Compaction Livelock

Ledger Index용 huge page 할당을 시도하다 커널이 메모리 compaction에 시간을 쓰지만 진전이 없는 livelock 상태를 만든다.

- 발생 조건: Regression Matrix에서 R10 클릭
- 관찰 지표: `Compaction` 상태가 `Livelock`
- 기대 증상: 8초 동안 시스템 상태가 livelock으로 유지

### R11. Journal Mirroring Bandwidth Halving

Safety Mirroring 모드에서는 단일 I/O 채널에 중복 저널 쓰기를 수행하는 것으로 모델링하여 쓰기 대역폭을 정확히 절반으로 낮춘다.

- 발생 조건: 기본 활성화, Regression Matrix에서 R11 클릭 시 토글
- 관찰 지표: `Journal Mirror`, `journalMirror` latency
- 기대 증상: mirroring 활성 시 vote journal write penalty가 2배

## Docker 관련 주의사항

기본 `docker-compose.yml`은 모든 환경에서 실행 가능하도록 앱 레벨 시뮬레이션을 사용한다.

실제 Linux cgroup 기반 I/O 제한까지 켜려면 다음 override 파일을 함께 사용한다.

```bash
docker compose -f docker-compose.yml -f docker-compose.linux-io.yml up --build
```

일부 Docker Desktop 또는 Windows 환경은 `blkio_config`의 `io.weight`를 지원하지 않아 컨테이너 시작이 실패할 수 있다. 이 경우 기본 `docker-compose.yml`만 사용해야 한다.

