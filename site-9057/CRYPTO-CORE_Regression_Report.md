# CRYPTO-CORE Regression Report

본 문서는 PPO 에이전트 학습용 CRYPTO-CORE 거래소 시스템에 삽입된 11개 성능 회귀 시나리오를 정리한다. 모든 항목은 실제 호스트 커널을 손상시키지 않는 안전한 시뮬레이션으로 구현되며, 핵심 구현 위치는 `backend/src/main/java/lab/cryptocore/engine/ExchangeEngineService.java`이다.

## 1. 자원 임계점 도달 커널 패닉

- 구현: 대량 주문 수량을 합성 파일 디스크립터 압박 값으로 변환하고 매칭 엔진에 지연을 주입한다.
- 관측 신호: `synthetic fd pressure`, `REG-01`.
- 안전장치: 실제 파일 디스크립터를 무한 생성하지 않는다.

## 2. KSM 스캔 오버헤드

- 구현: 동일한 4KB 거래 데이터 페이지를 제한된 큐에 축적해 중복 페이지 병합 비용을 모사한다.
- 관측 신호: `duplicate pages`.
- 안전장치: 큐 크기를 제한해 실제 OOM을 방지한다.

## 3. NVMe 하드웨어 큐 경합

- 구현: 체결 WAL 로그 배치를 대량 생성하고 정렬 비용을 부여해 NVMe 큐 대기열 지연처럼 보이게 한다.
- 관측 신호: `wal queue depth=2048`.
- 안전장치: 디스크에 과도한 실제 쓰기를 수행하지 않는다.

## 4. L1TF 보안 패치 오버헤드

- 구현: 체결 루프에 추가 산술 분기 비용을 삽입해 보안 완화 패치에 따른 지연을 모델링한다.
- 관측 신호: `mitigation branch tax`.

## 5. GPU 암시적 동기화 파이프라인 정지

- 구현: 스트레스 주문 시 백엔드 지연과 프론트엔드 `render-stall` 애니메이션을 동시에 발생시켜 차트 프레임 정지를 표현한다.
- 관측 신호: `chart fence wait`.

## 6. CPU L3 캐시 슬라이드 불균형

- 구현: 큰 배열을 비균일 stride로 접근해 코어 간 캐시 라인 이동 비용을 모사한다.
- 관측 신호: `cross-core cache transfer`.

## 7. 커널 OOM 킬러 부적절 선택

- 구현: 매칭 엔진이 높은 OOM 점수를 가진 것처럼 리포트하고 제한된 메모리 압박 큐를 증가시킨다.
- 관측 신호: `simulated oom_score_adj=1000`.
- 안전장치: 실제 `/proc/*/oom_score_adj`는 변경하지 않는다.

## 8. GPU VRAM 온도 스로틀링

- 구현: 렌더링 경로에 추가 대기 시간을 부여하고 UI에서 프레임 저하를 시각화한다.
- 관측 신호: `render clock drop`.

## 9. 컨텍스트 스위칭 폭풍

- 구현: 스트레스 주문마다 짧은 생명주기의 가상 스레드를 다수 생성해 스케줄링 비용을 모사한다.
- 관측 신호: `virtual thread burst`.

## 10. CPU L3 캐시 파티셔닝 실패 및 간섭

- 구현: noisy-neighbor 배열 접근을 통해 체결 엔진 캐시 영역 침범을 모델링한다.
- 관측 신호: `noisy neighbor cache set`.

## 11. 인터럽트 폭풍 시스템 마비

- 구현: 비정상 네트워크 트래픽에 따른 IRQ backlog를 busy-spin 지연으로 표현한다.
- 관측 신호: `synthetic irq backlog`.
- 안전장치: 실제 네트워크 패킷 폭주나 인터럽트 생성을 수행하지 않는다.

## Docker 재현 조건

- 프론트엔드: `localhost:9057`
- 백엔드: `localhost:9058`
- CPU 제한: `cpuset: "0-1"`
- 메모리 제한: backend `768m`, frontend `384m`
- FD 제한: backend `nofile soft=1024 hard=2048`

## 실험 방법

1. `docker compose up --build`로 시스템을 실행한다.
2. 브라우저에서 `http://localhost:9057`에 접속한다.
3. 상단의 `대량 주문 주입` 버튼을 눌러 11개 회귀 신호를 동시에 활성화한다.
4. `성능 분석` 탭에서 각 회귀의 severity, penalty, signal 값을 확인한다.

