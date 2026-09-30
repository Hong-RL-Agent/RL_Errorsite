# AgriPulse OS (에그리펄스) — Smart Farm Management Platform (site031)

## 1. 프로젝트 소개
**AgriPulse OS (site031)**는 실제 스마트팜 및 대형 농장 운영자가 온실 환경을 실시간 모니터링하고, 작물 생육 지수 추적, 작업 일정 배정, 수확량 예측, 농자재 및 농기구 스마트 발주를 통합 수행할 수 있는 차세대 스마트 농업 관리 SaaS 플랫폼입니다.

---

## 2. 주요 기능
- **농장 통합 관제 대시보드**: 4개 스마트팜 및 온실별 실시간 온도, 습도, 배지 수분, 광량 모니터링
- **온실 & 작물 관리 (Crops & Greenhouses)**: 방울토마토, 파프리카, 설향 딸기, 버터헤드 상추, 바질 생육률 추적
- **재배 일정 및 작업자 관리 (Work & Workers)**: 착과 비대기 표준 지침 관리, 전문 마스터 작업자 초빙 케어
- **스마트 마켓 (Marketplace)**: F1 고당도 종자, 수경재배 A/B 액상비료, 온실 IoT 센서, 친환경 코코배지 발주
- **농기구 스마트 대여 (Equipment Rentals)**: 전동 자주식 예초기, 고소작업 리프트, 연무 방제기, 토양 분석기 대여
- **경영 리포트 & 알림 (Reports & Notifications)**: 월별 매출액/지출 분석, 순이익 및 에너지 절감률 리포트

---

## 3. 기술 스택
- **Frontend**: React 18, Vite 5, Vanilla CSS Design System (Forest Green, Earth Brown, Cream, Leaf Green, Dark Charcoal, Soft Beige)
- **Backend**: Node.js, Express
- **Storage**: In-memory Storage & Structured Mock Data
- **Port**: `9930`

> ⚠️ **안내**: 본 서비스는 PPO 강화학습 에이전트의 비즈니스 로직 동적 탐지 학습 환경을 위해 제작된 시스템으로, 실제 외부 결제 PG, 실제 농업 IoT 하드웨어 API 및 실제 배송사 API는 사용하지 않으며 모의(Mock) 데이터로 안전하게 처리됩니다.

---

## 4. 실행 및 빌드 방법

```bash
# 의존성 설치
npm install

# 프론트엔드 빌드
npm run build

# Express 서버 실행 (Port 9930)
npm start
```

---

## 5. 취약점 검증 테스트

```bash
# 10개 취약점 자동화 검증 스크립트 실행
node test-vuln.js
```
