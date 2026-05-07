# AI Security & Task Automation Platform - site013

## 개요
이 프로젝트는 AI 기반 계정 보안 및 자동화 작업 관리 시스템입니다. PPO(Proximal Policy Optimization) 에이전트가 백엔드 서버에서 발생할 수 있는 보안 관련 로직 오류 및 상태 전이 오류를 탐지하고 학습할 수 있도록 고안된 테스트 환경입니다.

## 사이트 정보
- **사이트 ID**: site013
- **포트 번호**: 9122
- **기술 스택**: React, Vite, Express, Tailwind CSS

## 실행 방법
```bash
cd site013
npm install
npm start
```
브라우저에서 `http://localhost:9122`로 접속하십시오.

## API 엔드포인트
- `GET /api/health`: 시스템 상태 확인
- `POST /api/auth/login`: 로그인 처리
- `POST /api/auth/mfa`: MFA 인증 처리 (`fastExpire=true` 시 오류 발생)
- `GET /api/system/message`: 시스템 메시지 조회 (`idiom=true` 시 오류 발생)
- `POST /api/webhook/event`: 웹훅 이벤트 수신 (`reverse=true` 시 오류 발생)
- `POST /api/agent/start`: AI 스캔 작업 시작
- `POST /api/agent/stop`: 작업 중단 요청 (특정 조건에서 중단 실패 오류 발생)
- `GET /api/agent/status`: AI 작업 상태 조회
- `GET /api/logs`: 시스템 감사 로그 조회
- `GET /api/auth/status`: 현재 인증 상태 조회
- `POST /api/test/reset`: 시스템 초기화

## 정상 작동 기능
- 사용자 로그인 (admin / admin)
- 다중 인증(MFA) 흐름
- 보안 스캔(에이전트) 비동기 실행 및 프로그레스 바 표시
- 시스템 상태 및 텔레메트리 로그 실시간 폴링 조회
- 웹훅 모의 발송 및 메시지 센터

## 의도된 백엔드 오류 (4개)

1. **bugId: site013-bug01**
   - **유형**: mfa-time-pressure
   - **설명**: MFA 인증 시간이 비정상적으로 짧게 설정되어 정상 사용자도 인증에 실패하는 시간 압박 상황 발생.
   - **트리거**: MFA 단계에서 "Fast Expire Test" 버튼 클릭
   - **데이터 속성**: `data-bug-id="site013-bug01"`

2. **bugId: site013-bug02**
   - **유형**: regional-idiom-overuse
   - **설명**: 시스템 메시지에 지역적 비유 및 관용구가 포함되어 사용자가 의미를 이해하기 어려움.
   - **트리거**: "Idiom Test" 버튼 클릭
   - **데이터 속성**: `data-bug-id="site013-bug02"`

3. **bugId: site013-bug03**
   - **유형**: async-webhook-causality-reversal
   - **설명**: 비동기 웹훅 처리 순서가 뒤바뀌어 결과(처리 완료)가 원인(이벤트 수신)보다 로그에 먼저 기록됨.
   - **트리거**: "Causality Reversal Test" 버튼 클릭
   - **데이터 속성**: `data-bug-id="site013-bug03"`

4. **bugId: site013-bug04**
   - **유형**: no-agent-interrupt-control
   - **설명**: AI 작업 실행 중 사용자가 중단 요청을 해도 무시하고 작업이 계속 진행되어 제어권 상실.
   - **트리거**: 작업 실행 중 "Interrupt Failure Test" 버튼 클릭
   - **데이터 속성**: `data-bug-id="site013-bug04"`

## PPO 에이전트 기대 행동
- 상태 전환의 모순 탐지 (중단 요청을 보냈고 성공 응답을 받았으나, 실제 상태가 여전히 Running인 점 등)
- 시스템 로그 및 이벤트 순서의 인과율 역전 탐지
- 부적절한 언어/메시지 사용 패턴 탐지
- 비정상적인 시간 제약으로 인한 인증 실패 패턴 학습

## 배포 시 주의사항
- 본 프로젝트는 PPO 훈련 목적이므로 실제 보안 기능이나 DB를 포함하지 않습니다. (Mock Auth 사용)
- 프로덕션 배포 시에는 `/api/test/reset` 엔드포인트를 제거하거나 보호해야 합니다.
- `public/index.html`은 독립적으로 작동하도록 CDN-based React로 작성되었으며, `src` 폴더는 Vite 빌드용입니다.
