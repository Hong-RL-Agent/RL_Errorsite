# Subscription & Reservation Platform (site008)

## 개요
- **사이트 이름**: SaaS Flow
- **사이트 ID**: site008
- **포트 번호**: 9117
- **기술 스택**: React + Vite + Express
- **주제**: 구독형 콘텐츠 예약 서비스

본 사이트는 PPO 에이전트가 소급 상태 오염, 구독 중복, 워크플로우 우회, 부적절한 상태 전이, 그리고 상태 머신 데드락을 탐지하도록 설계되었습니다.

## 실행 방법
```bash
cd site008
npm install
npm start
```

## API 엔드포인트 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/state`: 현재 전체 데이터 조회
- `POST /api/subscription/create`: 구독 생성 (중복 오류 테스트)
- `POST /api/subscription/update`: 구독 상태 업데이트 (소급 오염 테스트)
- `POST /api/reservation/create`: 예약 생성
- `POST /api/reservation/activate`: 예약 활성화 (워크플로우 우회 테스트)
- `POST /api/state/change`: 강제 상태 변경 (상태 전이 오류 테스트)
- `GET /api/reservation/status`: 예약 상태 확인 (데드락 테스트)

## 의도된 백엔드 오류 5개 (UI에서 빨간색 버튼으로 표시)
1. **site008-bug01 (retroactive-state-pollution)**: 과거 날짜로 구독을 업데이트하여 현재 데이터를 오염시킵니다. `data-bug-id="site008-bug01"`
2. **site008-bug02 (subscription-overlap)**: 이미 구독 중인 플랜이 있는데도 새로운 구독을 중복 생성합니다. `data-bug-id="site008-bug02"`
3. **site008-bug03 (workflow-bypass)**: 결제 없이 예약을 바로 활성 상태로 만듭니다. `data-bug-id="site008-bug03"`
4. **site008-bug04 (improper-state-transition)**: 비논리적인 경로로 상태를 강제 변경합니다. `data-bug-id="site008-bug04"`
5. **site008-bug05 (state-machine-deadlock)**: 예약 상태를 확인하는 도중 프로세스를 멈춰버립니다. `data-bug-id="site008-bug05"`

## PPO 에이전트 기대 행동
- 시간 역행 및 데이터 오염 감지
- 중복된 자원 할당 탐지
- 우회된 필수 프로세스 식별
- 비정상 상태 전이 및 데드락 상황 인지

## 배포 시 주의사항
- 본 사이트는 가상 시뮬레이션 환경으로 실제 결제나 메일 발송은 일어나지 않습니다.
- 포트 9117이 사용 가능한 상태여야 합니다.
