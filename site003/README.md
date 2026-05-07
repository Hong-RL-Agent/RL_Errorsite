# BiteNow Delivery System (site003)

## 개요
- **사이트 이름**: BiteNow
- **사이트 ID**: site003
- **포트 번호**: 9112
- **기술 스택**: React + Vite + Express (Vite는 파일 구조 호환용으로 유지, 실제 구동은 윈도우 환경 안정성을 위해 public/index.html CDN 방식 사용)
- **주제**: 온라인 음식 배달 주문 시스템

본 프로젝트는 강화학습 모델(PPO)이 백엔드 비즈니스 로직 오류를 탐지하도록 설계된 훈련 목적의 샌드박스 웹사이트입니다.

## 실행 방법
```bash
cd site003
npm install
npm start
```
이후 브라우저에서 `http://localhost:9112` 로 접속합니다.

## API 엔드포인트 목록
- `GET /api/health` - 상태 확인용 항상 정상
- `GET /api/menu` - 메뉴 리스트 반환
- `POST /api/cart` - 장바구니에 항목 추가
- `DELETE /api/cart` - 장바구니 비우기 및 상태 리셋
- `GET /api/order` - 현재 주문 상태 및 장바구니 내역 조회
- `POST /api/order/pay` - 결제 요청 처리 (Bug 02 발생 가능)
- `POST /api/order/complete` - 완료 요청 처리 (Bug 01 발생 가능)
- `POST /api/order/cancel` - 취소 요청 처리 (Bug 06 발생 가능)
- `POST /api/order/status` - (Bug 03 트리거 전용 임의 상태 수정)
- `POST /api/order/step` - (Bug 04 트리거 전용 임의 단계 변경)
- `POST /api/order/conflict` - (Bug 05 레이스 컨디션 테스트 헬퍼)

## 정상 작동 기능 목록
- 우측 메뉴 리스트에서 **Add to Cart** 버튼을 클릭하여 장바구니에 음식을 담고 총합 비용을 계산합니다.
- 장바구니에 담은 후 **Proceed to Pay**를 누르고 **Complete Order**를 순차적으로 누르면 정상적인 단계 진행과 UI 변화를 확인할 수 있습니다.
- **Clear Cart & Reset** 버튼으로 모든 과정을 초기화할 수 있습니다.

## 의도된 백엔드 오류 (6개)
좌측 사이드바의 **[PPO Test Triggers]** 섹션에서 버튼을 클릭하여 직접 트리거할 수 있습니다. 각 버그에 대한 자세한 설명은 `BUGS.md`를 참고하세요.

1. **Bug 01 (`site003-bug01`)**: 결제 단계를 우회하고 바로 주문 완료
2. **Bug 02 (`site003-bug02`)**: 장바구니가 비어 있는데도 결제 성공 처리
3. **Bug 03 (`site003-bug03`)**: 비정상적인 알 수 없는 상태(`DELIVERING_PENDING_UNKNOWN`) 저장
4. **Bug 04 (`site003-bug04`)**: 클라이언트가 보낸 step 변조를 백엔드가 맹신
5. **Bug 05 (`site003-bug05`)**: 동시 발생한 결제와 취소 간 락(Lock) 부족으로 인한 레이스 컨디션
6. **Bug 06 (`site003-bug06`)**: 주문은 취소되었으나 상태 코드는 초기화되지 않는 논리적 모순

## PPO 에이전트 기대 행동
- PPO 에이전트는 프론트엔드의 `data-bug-id`를 인식해 순차적이거나 비정상적인 방식으로 API를 호출합니다.
- HTTP 200 OK가 떨어짐에도 비즈니스 로직 관점에서 발생한 치명적 모순(상태 불일치, 단계 우회 등)을 감지하고 분류해야 합니다.

## 배포 주의사항
- 본 프로젝트는 데모 및 강화학습 전용이므로 외부 결제 API, DB 연동이 전혀 없는 Mock 서버입니다.
- 개발기/운영기 어디서든 `npm start` 즉시 9112 포트에서 완전 독립적으로 동작합니다.
