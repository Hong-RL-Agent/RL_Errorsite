# CryptoWallet - site012

## 개요
CryptoWallet은 디지털 자산 지갑 및 거래 플랫폼입니다. 이 프로젝트는 PPO(Proximal Policy Optimization) 에이전트가 백엔드 로직 오류를 탐지하고 학습할 수 있도록 설계된 테스트 환경입니다.

## 사이트 정보
- **사이트 ID**: site012
- **포트 번호**: 9121
- **기술 스택**: React, Vite, Express, Tailwind CSS

## 실행 방법
```bash
cd site012
npm install
npm start
```
브라우저에서 `http://localhost:9121`으로 접속하십시오.

## API 엔드포인트
- `GET /api/health`: 시스템 상태 확인 (정상)
- `GET /api/wallet/balance`: 사용자 잔액 조회 (`shadow=true` 시 오류 트리거)
- `POST /api/transfer/send`: 송금 요청 (`fail=true` 또는 `log=true` 시 오류 트리거, 반복 요청 시 중복 처리 오류)
- `GET /api/transactions`: 거래 내역 조회
- `GET /api/logs`: 시스템 감사 로그 조회

## 정상 작동 기능
- 기본 잔액 조회
- 정상적인 송금 처리 및 거래 내역 업데이트
- 시스템 감사 로그 기록
- 로딩 및 기본 에러 상태 표시

## 의도된 백엔드 오류 (4개)

1. **bugId: site012-bug01**
   - **유형**: phantom-balance-shadow-account
   - **설명**: 특정 조건에서 실제 계정 외에 그림자 계정이 함께 조회되어 잔액이 중복 합산됩니다.
   - **트리거**: "Shadow Account Sync" 버튼 클릭 (`GET /api/wallet/balance?shadow=true`)
   - **데이터 속성**: `data-bug-id="site012-bug01"`

2. **bugId: site012-bug02**
   - **유형**: missing-idempotency-key
   - **설명**: 송금 API에서 멱등성 키(idempotency key) 검증이 없어 동일 요청이 중복 처리되어 잔액이 여러 번 차감됩니다.
   - **트리거**: "Idempotency Validation" 버튼 클릭 (동시 2개 `POST /api/transfer/send` 요청)
   - **데이터 속성**: `data-bug-id="site012-bug02"`

3. **bugId: site012-bug03**
   - **유형**: saga-compensation-failure
   - **설명**: 송금 처리 중 오류 발생 시 롤백 로직이 실패하여 잔액만 차감되고 상태는 실패로 남습니다.
   - **트리거**: "Saga Compensation" 버튼 클릭 (`POST /api/transfer/send?fail=true`)
   - **데이터 속성**: `data-bug-id="site012-bug03"`

4. **bugId: site012-bug04**
   - **유형**: side-effect-leak
   - **설명**: 인증 실패 등으로 요청이 거부되었음에도 불구하고 시스템 로그에는 해당 시도가 기록되는 부작용이 발생합니다.
   - **트리거**: "Side-Effect Isolation" 버튼 클릭 (`POST /api/transfer/send?log=true`)
   - **데이터 속성**: `data-bug-id="site012-bug04"`

## PPO 에이전트 기대 행동
- API 응답 내의 `bugId`를 확인하여 로직 오류 발생 시점 탐지
- 동일 요청에 대한 잔액 중복 차감 패턴 분석
- 에러 응답(500/403) 시에도 데이터(잔액, 로그)가 변조되는 현상 탐지
- 화면상의 에러 알림 UI와 백엔드 응답의 일치 여부 확인

## 파일 안내
- `BUGS.md`: 의도된 오류의 상세 기술 명세
- `TODO.md`: 프로젝트 구현 및 검증 체크리스트
