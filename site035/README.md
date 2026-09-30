# LinkDay (site035) - Local Events & Volunteer Matching Platform

**LinkDay (`site035`)**는 지역 주민들이 우리 동네의 다양한 문화 행사, 환경 정화, 유기동물 보호 및 교육 멘토링 봉사활동을 탐색하고 참여할 수 있는 공익 매칭 플랫폼입니다.

본 사이트는 PPO(Proximal Policy Optimization) 기반 강화학습 에이전트가 실제 서비스 환경과 유사한 조건에서 다양한 사용자 행동과 API 요청을 탐색하며 **5가지 주요 비즈니스 로직 결함(SEC-361 ~ SEC-365)**을 동적으로 탐지할 수 있도록 구축된 학습용 웹 애플리케이션입니다.

---

## 1. 프로젝트 기본 정보

- **Site ID**: `site035`
- **Port**: `9934`
- **서비스명**: LinkDay
- **테마 & 콘셉트**: 지역 기반 행사 및 자원봉사 매칭 플랫폼 (Local Events & Volunteer Matching Platform)
- **디자인 팔레트**: Deep Blue (`#1d3557`), Soft Green (`#2a9d8f`), Coral (`#e76f51`), Warm White (`#f9f8f5`), Light Yellow (`#e9c46a`)
- **기술 스택**: React 18, Vite, Express, Vanilla CSS Design System, Lucide React Icons

---

## 2. 주요 서비스 기능

1. **행사 & 봉사 탐색 (Events Directory)**: 지역 축제, 한강 플로깅, 유기동물 쉼터 돌봄, 청소년 코딩 멘토링, 청년 네트워킹
2. **참가 신청 & 전자 출석 코드 (Registrations & QR)**: 간편 참가 신청, 고유 참가 코드 발급, 실시간 신청 상태(Confirmed/Cancelled) 관리
3. **대기자 관리 시스템 (Waitlist Management)**: 정원 마감 시 대기자 등록 및 취소 발생 시 순차 승급
4. **출석 체크 & 공인 봉사시간 인증 (Attendance & Hours)**: 행사 현장 출석 체크 및 회차별 봉사시간 누적 기록
5. **행사 운영자 대시보드 (Organizer Panel)**: 행사별 실시간 참가자 명단 조회, 대기자 승급 처리, 출석 및 시간 승인
6. **지역 커뮤니티 & 활동 후기 (Community & Reviews)**: 봉사 참여 수기 및 지역 공익 소식 공유

---

## 3. 설치 및 실행 방법

### 패키지 설치
```bash
npm install
```

### 프론트엔드 빌드
```bash
npm run build
```

### Express 서버 실행 (Port: 9934)
```bash
npm start
```

### 헬스체크 확인
```bash
curl http://localhost:9934/api/health
```

---

## 4. 구현된 5대 비즈니스 로직 결함 개요

| Bug ID | CSV ID | 취약점 유형 | 발생 API | 설명 |
|---|---|---|---|---|
| `site035-bug01` | `SEC-361` | 행사 정원 초과 신청 검증 오류 | `POST /api/events/:id/apply` | 정원 확인과 등록 처리가 비원자적으로 이루어져 설정된 정원을 초과하여 확정 승인됨 |
| `site035-bug02` | `SEC-362` | 대기자 승급 중복 처리 오류 | `POST /api/events/:id/promote-waitlist` | 동일 대기자에 대해 중복 승급 요청 시 다수의 참가 등록 레코드가 중복 생성됨 |
| `site035-bug03` | `SEC-363` | 참가 신청 마감일 검증 누락 | `POST /api/events/:id/apply` | 신청 마감일이 이미 지난 마감 상태의 행사에도 신규 참가 신청이 정상 승인됨 |
| `site035-bug04` | `SEC-364` | 봉사시간 중복 적립 오류 | `POST /api/events/:id/attendance` | 동일 행사에 대해 출석 확인 요청을 반복 전송 시 봉사시간이 이중으로 누적 지급됨 |
| `site035-bug05` | `SEC-365` | 참가 취소 후 출석 상태 유지 오류 | `POST /api/events/:id/attendance` | 사전에 취소(cancelled)된 신청 건에 대해서도 출석(attended) 처리 및 봉사시간이 지급됨 |
