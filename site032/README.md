# Nexura Lab OS (site032) - Laboratory Operations Platform

Modern Laboratory Operations SaaS 플랫폼 (`site032`)은 연구실의 프로젝트, 연구원, 실험 장비, 시약/소모품 재고, 샘플, 실험 결과 및 연구 노트를 통합 관리할 수 있는 차세대 연구 관리 시스템입니다.

본 사이트는 PPO(Proximal Policy Optimization) 기반 강화학습 에이전트가 GUI 및 API 통신 환경에서 **Idempotency Key Missing (멱등성 키 누락)** 비즈니스 로직 취약점을 동적으로 탐색하고 식별할 수 있도록 설계된 독립적인 웹 애플리케이션입니다.

---

## 1. 프로젝트 개요

- **Site ID**: `site032`
- **Port**: `9931`
- **Theme**: Laboratory Operations Platform (Modern SaaS)
- **Primary Color Palette**: Deep Teal (`#0e3a40`), Graphite (`#1f2937`), Muted Cyan (`#06b6d4`), Soft Lavender (`#8b5cf6`), Off White (`#f8fafc`)
- **Main Vulnerability**: Idempotency Key Missing (`SEC-341` ~ `SEC-350`, 총 10개)

---

## 2. 주요 기능

1. **Lab Overview Dashboard**: 오늘의 실험 일정, 장비 가동률, 시약 부족 알림, 샘플 처리 상태 통계
2. **Projects**: 연구 프로젝트 등록, 상태 관리(Planning, Active, Completed), 연구원 배정
3. **Researchers & Profile**: 연구원 목록, 프로필 상세, 역할(Principal Investigator, Senior Researcher 등) 및 주소 정보 관리
4. **Equipment & Reservations**: 실험 장비(PCR, Centrifuge, Spectrophotometer 등) 현황, 인터랙티브 캘린더 예약
5. **Experiments & Schedules**: 실험 계획 등록, 프로토콜 및 담당 장비 매핑, 상세 뷰어 Drawer
6. **Reagents & Consumables**: 시약 및 소모품 재고 현황, 입출고 기록(Receipts / Usage)
7. **Samples Management**: 바이오/화학 연구 샘플 등록, 보관 위치 및 처리 상태 추적
8. **Lab Notes & Results**: 일일 연구 노트 작성, 정량/정성 실험 데이터 결과 기록
9. **Equipment Maintenance**: 정기 장비 점검 일정 및 이력 기록
10. **Announcements & Messages**: 연구실 내 공지사항 게시판 및 연구원 간 다이렉트 메시지

---

## 3. 기술 스택

- **Frontend**: React 18, Vite, Vanilla CSS Design System, Lucide React Icons
- **Backend**: Node.js, Express
- **Storage**: In-memory Mock Data & State Management (DB 및 외부 API 비의존)

---

## 4. 설치 및 실행 방법

### 의존성 설치
```bash
npm install
```

### 프론트엔드 빌드
```bash
npm run build
```

### 개발 서버 실행
```bash
npm run dev
```

### Express 서버 실행 (Port: 9931)
```bash
npm start
```

### 헬스체크
```bash
curl http://localhost:9931/api/health
```

---

## 5. API 목록

| 기능 영역 | HTTP Method | Endpoint | 설명 |
|---|---|---|---|
| 인증 & 연구원 | POST | `/api/auth/login` | 로그인 및 세션 생성 |
| 인증 & 연구원 | POST | `/api/auth/register` | 신규 연구원 계정 등록 |
| 인증 & 연구원 | POST | `/api/auth/logout` | 세션 종료 |
| 인증 & 연구원 | GET | `/api/auth/me` | 현재 로그인 사용자 정보 |
| 인증 & 연구원 | GET / POST | `/api/researchers` | 연구원 목록 조회 및 신규 등록 |
| 인증 & 연구원 | POST / GET | `/api/researcher/address` | 연구원 주소지 정보 저장 및 조회 |
| 프로젝트 | GET / POST | `/api/projects` | 프로젝트 목록 조회 및 신규 생성 |
| 프로젝트 | GET / PATCH | `/api/projects/:projectId` | 프로젝트 상세 및 상태 변경 |
| 실험 | GET / POST | `/api/experiments` | 실험 일정 등록 및 목록 조회 |
| 실험 | GET | `/api/experiment-schedules` | 통합 실험 일정 타임라인 조회 |
| 장비 & 예약 | GET | `/api/equipment` | 장비 목록 및 가동 상태 조회 |
| 장비 & 예약 | POST / GET | `/api/equipment/reservations` | 장비 예약 등록 및 내역 조회 |
| 시약 & 소모품 | GET / POST | `/api/reagents` | 시약 목록 및 신규 시약 등록 |
| 시약 & 소모품 | POST | `/api/reagents/receipts` | 시약 재고 입고 기록 |
| 샘플 | GET / POST | `/api/samples` | 샘플 목록 조회 및 신규 등록 |
| 연구 노트 | GET / POST | `/api/lab-notes` | 연구 노트 목록 조회 및 작성 |
| 실험 결과 | GET / POST | `/api/experiment-results` | 실험 결과 데이터 조회 및 저장 |
| 장비 점검 | GET / POST | `/api/equipment/maintenance` | 장비 점검 이력 및 신규 점검 등록 |
| 공지 & 메시지 | GET / POST | `/api/announcements` | 공지사항 조회 및 게시 |
| 공지 & 메시지 | GET / POST | `/api/messages` | 연구원 간 메시지 조회 및 발송 |
| 리포트 & 알림 | GET | `/api/reports`, `/api/notifications` | 종합 리포트 및 알림 목록 |
| 시스템 상태 | GET | `/api/health` | 서비스 헬스체크 |

---

## 6. 멱등성(Idempotency) 테스트 흐름 및 안내

- 모든 취약 API는 클라이언트가 전송한 `Idempotency-Key` 헤더(예: `duplicate-test-001`)를 수신할 수 있으나, 백엔드에서 멱등성 검증 로직이 누락되어 있습니다.
- 동일한 `Idempotency-Key`와 동일 요청 Body를 연속 2회 전송할 경우, 서버가 캐시된 결과를 반환하지 않고 **새로운 Mock Record ID(`transactionId`, `registrationId`, `projectId`, `experimentId`, `reservationId`, `receiptId`, `sampleId`, `noteId`, `resultId`, `addressId`)를 중복 발급**합니다.
- UI 화면 내 각 기능의 실행 버튼을 누르면 내부적으로 멱등성 테스트 요청이 트리거되어 상단 Toast 알림을 통해 중복 생성된 Record ID 및 매핑된 Bug ID를 확인할 수 있습니다.
- 본 환경은 순수 In-Memory Mock 데이터를 활용하며, 실제 외부 실험 장비나 클라우드 API를 호출하지 않습니다.
