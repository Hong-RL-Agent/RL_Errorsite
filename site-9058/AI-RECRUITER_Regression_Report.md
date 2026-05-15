# AI-RECRUITER Regression Report

이 문서는 PPO 에이전트 연구를 위해 AI-RECRUITER에 의도적으로 포함된 하드웨어 병목 및 불합리한 비즈니스 로직을 정리한다.

## 결함 목록

1. **GPU P2P 통신 데드락**
   - 위치: `InterviewAnalysisService.simulateGpuP2pDeadlock`
   - 재현: `/api/analysis/run` 호출 시 후보자 ID 해시가 특정 조건에 맞으면 두 GPU 작업이 서로의 락을 기다리는 상태로 전환된다.
   - 관찰 지표: `gpuP2pDeadlock=true`, `status=STALLED`

2. **메모리 내부 파편화와 유령 누수**
   - 위치: `simulateFragmentedMemory`
   - 재현: 작은 청크를 많이 예약하고 실제 요청보다 큰 가상 예약량을 기록해 가용 메모리가 있어도 대형 할당이 실패하도록 한다.
   - 관찰 지표: `fragmentedMemoryMb`, `allocationFailure=true`

3. **스펙큘러 실행 패치 IPC 하락**
   - 위치: `simulateSpeculativePatchIpcDrop`
   - 재현: `AI_RECRUITER_CPU_PATCHED=true`일 때 CPU 연산 지연 계수를 적용한다.
   - 관찰 지표: `ipcScore` 감소, `cpuPatchPenaltyMs` 증가

4. **메모리 TRR에 의한 대역폭 잠식**
   - 위치: `simulateTrrBandwidthTax`
   - 재현: `AI_RECRUITER_TRR_ENABLED=true`일 때 Rowhammer 방어 루틴이 대역폭을 점유하는 것으로 계산한다.
   - 관찰 지표: `memoryBandwidthGbps` 감소

5. **GPU 레지스터 파일 부족 및 점유율 하락**
   - 위치: `simulateRegisterPressure`
   - 재현: 모델 복잡도가 높을수록 레지스터 요구량이 증가하고 GPU occupancy가 급락한다.
   - 관찰 지표: `gpuOccupancyPercent` 감소

6. **비결정적 테일 레이턴시**
   - 위치: `simulateTailLatency`
   - 재현: 1% 확률로 요청 처리에 3초 이상의 지연을 추가한다.
   - 관찰 지표: `tailLatencySpike=true`, `networkLatencyMs>=3000`

7. **고성능 기기 및 최신 OS 강요**
   - 위치: 프론트엔드 `environmentGuard`
   - 재현: 낮은 CPU 코어 수, 낮은 메모리, 구형 OS User-Agent 감지 시 지원하지 않는 환경 모달을 띄운다.
   - 관찰 지표: `UnsupportedEnvironmentModal`

8. **오프라인 모드 미지원**
   - 위치: 프론트엔드 `useOfflineEviction`
   - 재현: `offline` 이벤트가 발생하면 입력 상태를 삭제하고 메인 대시보드로 이동한다.
   - 관찰 지표: 사용자 입력 손실, `sessionStorage` 제거

9. **특정 결제 수단 강요**
   - 위치: `BillingPage`
   - 재현: 결제 수단으로 내부 가상 포인트인 `RecruiterPoint`만 선택 가능하다.
   - 관찰 지표: 외부 카드/계좌 선택 비활성화

10. **고가 기기 전용 기능**
    - 위치: 프론트엔드 `VideoAnalysisDashboard`
    - 재현: 카메라 해상도가 1920x1080 미만이면 분석 버튼을 비활성화한다.
    - 관찰 지표: `analysisDisabled=true`

11. **환경 변수 주입 실패**
    - 위치: `ApiKeyStartupValidator`
    - 재현: Docker Compose에서 `AI_RECRUITER_API_KEY`를 의도적으로 누락한다.
    - 관찰 지표: 백엔드 초기화 실패 로그 `AI_RECRUITER_API_KEY is required`

## 연구 활용 메모

- API 응답은 정상 상태처럼 보이는 지표와 결함 상태를 함께 반환한다.
- 프론트엔드는 상용 SaaS처럼 보이는 대시보드지만, 환경/결제/오프라인 정책은 비합리적으로 제한되어 있다.
- Docker 환경은 API Key 누락과 자원 제한을 동시에 제공하여 초기화 실패 및 성능 병목 재현에 사용한다.
