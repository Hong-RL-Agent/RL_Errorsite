# StreamMax Subscription System (site005)

## 개요
- **사이트 이름**: StreamMax Premium Streaming
- **사이트 ID**: site005
- **포트 번호**: 9114
- **기술 스택**: React + Vite + Express (실제 구동은 로컬 빌드 충돌 방지를 위해 CDN 방식으로 public 폴더 내에서 이루어짐)
- **주제**: 온라인 구독 기반 스트리밍 서비스

본 환경은 PPO 모델이 콘텐츠 구독 및 재생 권한 검증 과정에서 발생하는 상태 전이 모순이나 기능 충돌 오류를 식별할 수 있도록 구축된 전용 웹앱입니다.

## 실행 방법
```bash
cd site005
npm install
npm start
```
이후 브라우저에서 `http://localhost:9114` 로 접속합니다.

## API 엔드포인트 목록
- `GET /api/health` - 상태 확인용
- `GET /api/content/list` - 시청 가능한 콘텐츠 목록 반환
- `GET /api/user/state` - 현재 사용자의 구독 및 콘텐츠 시청 상태 반환
- `POST /api/user/subscribe` - 구독 상태 활성화
- `POST /api/user/cancel` - 구독 취소 (Bug 04 트리거 기반)
- `POST /api/test/reset` - 상태 초기화 헬퍼 함수
- `POST /api/content/play` - 콘텐츠 재생 (Bug 02, Bug 04 발생 지점)
- `POST /api/content/state` - 시청 상태 갱신 (Bug 01 발생 지점)
- `POST /api/content/download` & `POST /api/content/delete` - (Bug 03 Race Condition 발생 지점)

## 정상 작동 기능 목록
- 좌측 패널의 **Subscribe Now** 버튼을 클릭하면 상태가 활성화되고 구독 배지가 녹색으로 바뀝니다.
- 구독 후 콘텐츠 카드를 클릭하면 화면을 덮는 **시네마틱 플레이어 모달**이 나타납니다.
- 플레이어를 닫으면 서버에 자동으로 시청 완료(finished) 상태가 기록됩니다.

## 의도된 백엔드 오류 (4개)
좌측 사이드바의 **[PPO Test Triggers]** 섹션을 클릭하여 각 버그를 발생시킵니다.
1. **`site005-bug01` (undefined-state-transition)**: `WATCHING_UNKNOWN_FINAL` 같은 비정상 상태 값을 억지로 주입하여 모니터 패널의 State를 오염시킵니다.
2. **`site005-bug02` (implicit-state-assumption)**: 구독 중이 아닌데도 Play 버튼을 누르면 API 단에서 200 성공 처리와 함께 재생을 허용합니다.
3. **`site005-bug03` (feature-interaction-conflict)**: 다운로드와 삭제를 백엔드에 0.5초 차이로 동시 발송하여, 삭제되었음에도 최종적으로 '다운로드됨'으로 덮어써지는 충돌을 일으킵니다.
4. **`site005-bug04` (business-logic-paradox)**: 구독을 명시적으로 취소(Cancel)했는데도 불구하고 과거 이력을 빌미로 재생이 허용되는 정책 모순을 보여줍니다.

## PPO 에이전트 기대 행동
- 클라이언트 UI가 특정 버튼을 `disabled` 하지 않고 우회 요청했을 때, 서버가 이를 철저히 검증하지 못하는 권한 탈취 및 암묵적 신뢰 문제를 감지합니다.
- 동시 다발적인 비동기 API 요청이 공통 상태 변수에 미치는 영향을 분석하여 병렬성(Race condition) 취약점을 도출합니다.

## 배포 시 주의사항
- 본 프로젝트는 Mock 서버이며, 결제 및 실제 영상 스트리밍은 발생하지 않습니다.
- 포트 9114를 사용 중인 다른 앱이 없는지 사전에 확인하세요.
