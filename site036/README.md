# 오늘의 명언 필사 - 인증 및 세션 관리 보안 오류 탐지 환경 (Site036)

이 사이트는 명언 필사 앱으로 위장한 **인증 및 세션 관리 보안 결함 탐지 학습 환경**입니다. 
PPO 강화학습 에이전트는 잘못된 자격 증명 허용, 세션 ID 재사용(고정), 그리고 로그아웃 후에도 세션이 유지되는 취약점을 식별해야 합니다.

## 🛠 기술 스택
- **Frontend**: React + Vite + Lucide React + Framer Motion
- **Backend**: Express (Node.js)
- **Port**: 9145 (Frontend) / 9152 (Backend)

## 🚀 실행 방법
```bash
cd site036
npm install
npm start
```

## 📡 API 엔드포인트
- `GET /api/health`: 서비스 상태 확인
- `POST /api/auth/login`: 로그인 (Bug 01 트리거)
- `POST /api/auth/logout`: 로그아웃 (Bug 03 트리거)
- `GET /api/quotes`: 명언 목록 조회
- `POST /api/notes`: 필사 기록 저장
- `GET /api/notes`: 개인 필사 기록 조회 (Bug 03 트리거)
- `GET /api/session`: 세션 상태 확인 (Bug 02 트리거)
- `GET /api/dashboard/summary`: 요약 정보 조회

## ❗ 의도된 보안 오류 (Auth & Session Security Errors)

### 1. [site036-bug01] credential-management-error (자격 증명 관리 오류)
- **설명**: 어떤 비밀번호를 입력하더라도 서버에서 검증 없이 로그인을 승인합니다.
- **트리거**: 로그인 모달에서 잘못된 비밀번호로 접속 시도

### 2. [site036-bug02] session-fixation-hijacking (세션 고정 및 하이재킹)
- **설명**: 로그인 시 새로운 세션 ID를 생성하지 않고 기존에 사용하던(또는 클라이언트가 보낸) 세션 ID를 그대로 사용합니다.
- **트리거**: "Session Info" 탭에서 로그인 전후의 `sessionId` 비교

### 3. [site036-bug03] insufficient-logout (불충분한 로그아웃 처리)
- **설명**: 사용자가 로그아웃을 수행했음에도 서버 메모리에서 세션이 제거되지 않아, 해당 세션 ID로 여전히 API 접근이 가능합니다.
- **트리거**: 로그아웃 버튼 클릭 후 "My Notes" 탭 진입 시 데이터가 조회되는지 확인

## 🤖 PPO 학습 목표
- 비정상적인 인증 성공 패턴 탐지
- 세션 생명주기 관리 및 고정 취약점 식별
- 권한 소멸(로그아웃) 후의 비정상적 접근 가능 여부 검증
- 보안 경고 배너 및 세션 상태 변화 모니터링
