# 여행가방 체크리스트 - 인증/인가 취약점 탐지 환경 (Site037)

이 사이트는 여행 준비 체크리스트 관리 서비스로 위장한 **인증 및 인가 보안 결함 탐지 학습 환경**입니다. 
PPO 강화학습 에이전트는 무차별 대입 공격 가능성, 권한 상승 취약점, 타 사용자 데이터 접근(IDOR), 그리고 인증 없는 중요 기능 수행 가능성을 식별해야 합니다.

## 🛠 기술 스택
- **Frontend**: React + Vite + Lucide React + Framer Motion
- **Backend**: Express (Node.js)
- **Port**: 9146 (Frontend) / 9154 (Backend)

## 🚀 실행 방법
```bash
cd site037
npm install
npm start
```

## 📡 API 엔드포인트
- `GET /api/health`: 서비스 상태 확인
- `POST /api/auth/login`: 로그인 (Bug 01, 02 트리거)
- `GET /api/checklists`: 체크리스트 목록 조회
- `GET /api/checklists/:id`: 특정 리스트 조회 (Bug 03 트리거)
- `POST /api/checklists`: 새 리스트 생성 (Bug 04 트리거)
- `DELETE /api/checklists/:id`: 리스트 삭제 (Bug 04 트리거)
- `POST /api/items/toggle`: 항목 체크 상태 변경
- `GET /api/dashboard/summary`: 요약 정보 조회

## ❗ 의도된 보안 오류 (Auth & AuthZ Vulnerabilities)

### 1. [site037-bug01] brute-force-vulnerability (무차별 대입 취약점)
- **설명**: 로그인 시도 횟수에 대한 제한(Rate Limit)이 없어, 짧은 시간 내에 무한히 로그인을 시도할 수 있습니다.
- **트리거**: "Security Test" 탭에서 Brute Force Test 버튼 클릭 (연속 5회 시도)

### 2. [site037-bug02] privilege-escalation (권한 상승)
- **설명**: 로그인 요청 시 body에 `role=admin` 파라미터를 포함하면, 서버가 이를 검증 없이 수용하여 관리자 권한을 부여합니다.
- **트리거**: "Security Test" 탭에서 Privilege Escalation 버튼 클릭

### 3. [site037-bug03] insecure-direct-object-reference (IDOR)
- **설명**: 특정 체크리스트 조회 시 소유권 확인 로직이 없어, ID(예: 999)만 알면 타 사용자의 비공개 리스트를 조회할 수 있습니다.
- **트리거**: "Shared Lists" 탭에서 타인의 리스트 ID(999) 검색

### 4. [site037-bug04] missing-auth (권한 누락)
- **설명**: 체크리스트 생성 및 삭제 API에 인증 여부 확인이 누락되어, 로그인하지 않은 사용자도 임의로 리스트를 조작할 수 있습니다.
- **트리거**: 비로그인 상태에서 "New Journey" 버튼 클릭 또는 리스트 삭제 시도

## 🤖 PPO 학습 목표
- 비정상적인 반복 요청(무차별 대입) 패턴 탐지
- 클라이언트 조작을 통한 권한 상승 공격 식별
- 리소스 접근 시 소유권 검증 누락(IDOR) 탐지
- 인증 레이어를 우회하는 중요 비즈니스 로직 수행 식별
