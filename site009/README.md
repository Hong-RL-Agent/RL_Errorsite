# Internet Banking Simulation Service (site009)

이 서비스는 안전한 자산 관리 및 이체 기능을 모방한 가상 인터넷 뱅킹(Internet Banking) 모의 시스템입니다. 

## 기술 스택
- **프론트엔드**: React, Vite, Vanilla CSS
- **백엔드**: Node.js, Express (Single-page app static 서빙)

## 주요 기능
- **계좌 대시보드 (Dashboard)**: 계좌 요약 정보, 자산 구성 그래프 및 최근 이체 거래 내역 조회
- **금융 업무 관리**: 대량 거래 내역 가져오기(Imports), 전자 문서(Electronic Documents) 및 가족 공동 금융계좌(Family Banking Teams) 연동
- **환경 설정 및 보안**: 접근 제어 역할 설정(Permission Roles), 보안 기기 관리(Registered Devices), 오픈뱅킹 API Key 설정 및 금융 알림 웹훅(Notification Hooks) 관리
- **이체 예약**: 예약 이체 작업(Scheduled Transfers) 및 자동 이체 자동 구독(Auto Subscriptions) 관리
- **감사 및 이력 조회**: 계좌 접근 로그(Access Logs) 조회
- **사용자 역할(Role) 시뮬레이션**: 관리자(Admin), 은행 임직원(Employee), 일반 고객(Customer) 역할을 전환하고 이에 대응하는 가상 권한을 제어할 수 있는 관리 패널 제공

## 실행 방법

### 의존성 설치
```bash
cd site009
npm install
```

### 로컬 실행 (Express 및 React 빌드 정적 제공)
```bash
npm start
```
서버가 실행되면 브라우저에서 `http://localhost:9908`으로 접속 가능합니다.

### 개발 모드 (Vite 빌드 빌드 동적 연동)
```bash
npm run dev
```

---

> [!NOTE]
> 본 애플리케이션은 가상으로 동작하는 모의 뱅킹 환경입니다. 실제 금융기관 API, 외부 Open Banking API, 인증 서버 및 실제 카드사/은행 데이터베이스와 연동하지 않으며 모든 데이터는 인메모리 Mock 데이터로 처리됩니다.
