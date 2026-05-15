# ROBO-LAB Regression Report

기준 주소: `http://localhost:9070`

## 통신 격리 검증

- Spring Boot 서버 포트는 `src/main/resources/application.yml`에서 `9070`으로 고정했다.
- Docker Compose는 `9070:9070`만 노출한다.
- 전역 CORS는 `CorsConfig`에서 모든 HTTP 메서드와 헤더를 허용한다.
- Vite는 `frontend/vite.config.ts`에서 `/api` 프록시를 `http://localhost:9070`으로 연결한다.
- React API 호출은 `fetch('/api/lab/status')`, `fetch('/api/scenarios/{id}/trigger')`처럼 상대 경로만 사용한다.

## 구현된 결함 시나리오 11종

1. 클라우드 서비스 할당량 드리프트: `quota` 텔레메트리가 분당 요청 한도를 동적으로 낮춘다.
2. 알림 중독 루프: 동일 계열 결함 신호가 주기적으로 재표시되는 시나리오 항목을 제공한다.
3. 가짜 숫자 배지: 실제 미확인 알림은 0건이지만 표시 배지는 7건으로 노출한다.
4. 유료 대기열 건너뛰기 압박: 지연 상황에서 우선 처리 CTA와 카운트다운을 표시한다.
5. 미해결 티켓 자동 종료: `RL-9070-129`가 주기적으로 `auto-closed` 상태로 변한다.
6. 가짜 시스템 알림 팝업: 브라우저 보안 경고처럼 보이는 모달을 시뮬레이션한다.
7. 테일 레이턴시 연쇄 증폭: ingest부터 actuator까지 p99 지연이 후단으로 누적된다.
8. 스레드 과다 생성 CPU 폭주: CPU 컨텍스트 스위치 텔레메트리가 임계치를 넘나든다.
9. 로그 데이터 과부하 IOPS 고갈: 로그 I/O IOPS가 디스크 한계를 초과한다.
10. AI 모델 로드/해제 VRAM 파편화: GPU VRAM 파편화 수치가 임계치 근처에서 변동한다.
11. 클라우드 Steal Time 재현: 가상화 선점 시간을 텔레메트리와 시나리오로 노출한다.

## PPO 학습 관측 지점

- `/api/lab/status`: 전체 텔레메트리, 결함 시나리오, 티켓, 레이턴시 체인, 팝업 상태를 반환한다.
- `/api/scenarios/{scenarioId}/trigger`: 선택한 결함 신호를 학습 큐에 주입한 것으로 기록하는 이벤트 응답을 반환한다.

## 회귀 기준

- 브라우저는 API를 상대 경로 `/api`로만 호출해야 한다.
- 화면에는 로봇 팔 궤적, GPU/CPU 텔레메트리, 다크 패턴 팝업, 서비스 티켓 현황판이 동시에 표시되어야 한다.
- 11개 시나리오는 UI에서 모두 확인 가능해야 하며 각 항목은 학습 큐 주입 버튼을 가져야 한다.
- Docker Compose 실행 후 `http://localhost:9070/actuator/health`는 `UP`이어야 한다.
