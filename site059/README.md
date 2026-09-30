# CareBridge — 병원 예약·진료 관리 플랫폼 (site059)

CareBridge는 환자가 가까운 병원과 전문의를 검색하고, 실시간 진료 가능 시간을 확인하여 1분 만에 예약할 수 있는 스마트 병원 예약 O2O 플랫폼입니다.

---

## 1. 프로젝트 정보

- **Site ID**: `site059`
- **Port**: `9958`
- **Service Name**: `CareBridge`
- **Theme**: 병원·의사 검색 및 진료 예약 플랫폼
- **Frontend**: React 18 + Vite SPA
- **Backend**: Node.js + Express (Port 9958)
- **Data Layer**: In-Memory Mock Data (외부 DB 및 외부 API 미사용)

---

## 2. 기술 스택

- **Frontend**: React, Lucide React (아이콘), Vanilla CSS (Design System Tokens)
- **Backend**: Express.js, CORS
- **Build & Dev Tool**: Vite 5
- **Icons & Typography**: Pretendard, Lucide Icons

---

## 3. 디렉토리 구조

```text
site059/
├── package.json
├── vite.config.js
├── index.html
├── server.js
├── README.md
├── BUGS.md
├── bug.md
├── TODO.md
├── dist/
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── api/
    │   └── client.js
    ├── components/
    │   ├── Header.jsx
    │   ├── HospitalCard.jsx
    │   ├── DoctorCard.jsx
    │   ├── DepartmentBadge.jsx
    │   ├── AppointmentCalendar.jsx
    │   ├── TimeSlotGrid.jsx
    │   ├── AppointmentSummary.jsx
    │   └── NoticeBanner.jsx
    └── pages/
        ├── Home.jsx
        ├── Hospitals.jsx
        ├── HospitalDetail.jsx
        ├── DoctorDetail.jsx
        ├── Booking.jsx
        ├── Appointments.jsx
        └── Account.jsx
```

---

## 4. 실행 및 빌드 방법

### 1) 의존성 설치
```bash
cd site059
npm install
```

### 2) 독립 서버 실행 (Express + Built Frontend)
```bash
npm start
```
- 기본 포트: `http://localhost:9958`

### 3) 개발 모드 실행 (Vite Dev Server)
```bash
npm run dev
```

### 4) 프로덕션 빌드
```bash
npm run build
```

---

## 5. 주요 기능

1. **홈 (Home)**: 주요 진료과 퀵 필터, 가까운 추천 병원 목록, 대표 전문의 카드, 최신 공지사항 배너.
2. **병원/의사 검색 (Hospitals)**: 지역별 필터, 진료과별 필터, 키워드 검색, 병원별/의사별 탭 전환.
3. **병원 상세 (HospitalDetail)**: 병원 주소, 진료시간, 대표 번호, 소속 전문의 프로필 탭, 즉시 예약 연결.
4. **의사 상세 (DoctorDetail)**: 전문 분야, 세부 진료 일정, 학력 및 수련 경력, 소속 병원 정보.
5. **진료 예약 (Booking)**: 병원/의사 선택 → 날짜(캘린더) 선택 → 시간대(09:00~18:30) 선택 → 예약자 정보 입력 → 예약 완료.
6. **예약 내역 (Appointments)**: 실시간 예약 상태 조회(예약 완료/예약 예정/진료 완료/취소), 예약 취소 모달.
7. **마이페이지 (Account)**: 환자 프로필, 즐겨찾기 병원 관리, 알림톡/이메일 개인화 설정.

---

## 6. 백엔드 API 명세

| Method | Endpoint | 설명 |
| :--- | :--- | :--- |
| `GET` | `/api/health` | 서버 상태 점검 |
| `GET` | `/api/departments` | 진료과목 목록 조회 |
| `GET` | `/api/hospitals` | 병원 목록 및 필터링 검색 |
| `GET` | `/api/hospitals/:id` | 병원 상세 및 소속 의사 목록 |
| `GET` | `/api/doctors` | 의사 목록 및 경력/진료과 검색 |
| `GET` | `/api/doctors/:id` | 의사 상세 정보 조회 |
| `GET` | `/api/doctors/:id/availability` | 의사별 진료 가능 일자 및 시간대 조회 |
| `GET` | `/api/appointments` | 전체 진료 예약 내역 조회 |
| `GET` | `/api/appointments/:id` | 특정 예약 상세 조회 |
| `POST` | `/api/appointments` | 신규 진료 예약 등록 |
| `PATCH` | `/api/appointments/:id` | 예약 상태 및 정보 수정 |
| `DELETE` | `/api/appointments/:id` | 진료 예약 취소 |
| `GET` | `/api/notices` | 공지사항 목록 조회 |

---

## 7. Mock Data 구성

- **병원**: 서울권 12개 우수 메디컬 센터
- **진료과목**: 내과, 정형외과, 피부과, 이비인후과, 안과, 치과, 소아청소년과, 신경과 등 8개 진료과
- **의사**: 병원별 대표 원장 및 전문의 16인
- **시간대**: 09:00 ~ 18:30 (오전/오후 18개 타임슬롯)
- **예약 내역**: 5개 기본 샘플 예약 및 사용자 동적 생성 지원
- **공지사항**: 8건의 의료 및 예약 정책 공지
