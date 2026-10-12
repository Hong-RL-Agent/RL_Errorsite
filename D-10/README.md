# EventWave (D-10) - 행사 참가 신청 및 티켓 패스 관리 플랫폼

EventWave는 대규모 기술 컨퍼런스, 디자인 세미나, 핸즈온 워크숍, 비즈니스 네트워킹 등의 행사를 탐색하고, 참가 신청, 티켓 패스 발급 및 참석자 정보를 관리할 수 있는 현대적인 행사 예약 플랫폼입니다.
본 프로젝트는 **RAWD DQN Unseen Test** 환경으로 제작되었으며, 이전 훈련 사이트와 완전히 차별화된 도메인 UI와 구조(플래그십 대형 배너, 전자 티켓 패스, 잔여 인원 프로그레스, 실시간 좌석 등급 위자드 등)를 제공합니다.

---

## 1. 기술 스택 (Tech Stack)

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React
  - **Port**: `9710`
  - **Path**: `frontend/`
- **Backend**: Node.js, Express, Better-SQLite3
  - **Port**: `9810`
  - **Path**: `backend/`
- **Database**: SQLite (`backend/eventwave.db`)
  - 자동 초기화 및 시드 데이터 (16명 사용자, 6개 카테고리, 26개 행사, 42건 신청 데이터)

---

## 2. 프로젝트 디렉터리 구조

```
D-10/
├── backend/
│   ├── .env                    # PORT=9810
│   ├── package.json
│   ├── db.js                   # SQLite DB 스키마, 시드 데이터 및 initDatabase, resetAllData 함수
│   ├── server.js               # Express REST API 서버 및 5대 의도적 오류 핸들링
│   └── test-api.js             # 5대 오류 재현 및 멱등 리셋 자동 검증 스크립트
├── frontend/
│   ├── package.json
│   ├── next.config.js          # Next.js 설정 및 /api/:path* -> 9810 리라이트 프록시
│   ├── tailwind.config.js      # 바이올렛(#7C3AED), 오렌지(#F97316) 포인트 테마
│   ├── postcss.config.js
│   └── src/
│       ├── app/
│       │   ├── layout.jsx      # 글로벌 레이아웃, 메타데이터, 폰트
│       │   ├── globals.css     # 전역 스타일 및 유틸리티
│       │   └── page.jsx        # 메인 대시보드 (행사 탐색, 필터, 탭 전환)
│       ├── components/
│       │   ├── Header.jsx              # 상위 네비게이션, 사용자 전환, 탭 메뉴
│       │   ├── HeroBanner.jsx          # 플래그십 대형 행사 배너 및 슬라이드
│       │   ├── EventGrid.jsx           # 행사 카드 그리드, 카테고리 필터, 검색, 잔여석 표시
│       │   ├── RegistrationModal.jsx   # 다단계 참가 신청 모달 (티켓 선택, 인원, 참석자 정보)
│       │   ├── MyPassesView.jsx        # 나의 참가권(Pass) 목록, 전자 티켓 바코드/QR UI
│       │   ├── PassDetailModal.jsx     # 참가권 상세 정보 모달
│       │   ├── AttendeeEditModal.jsx   # 참석자 이름 변경 모달
│       │   └── ContactEditModal.jsx    # 참석자 연락처 변경 모달
│       └── lib/
│           └── api.js                  # 백엔드 API 클라이언트 함수 모음
├── BUGS.md                     # RAWD DQN 평가를 위한 5대 의도적 오류 상세 명세
└── README.md                   # 본 프로젝트 설명서
```

---

## 3. 설치 및 실행 방법 (Getting Started)

### 사전 요구사항
- Node.js v18 이상 및 npm

### 백엔드 (Backend) 실행
```bash
cd backend
npm install
npm start
# -> Backend running on http://localhost:9810
```

### 프론트엔드 (Frontend) 실행
```bash
cd frontend
npm install
npm run dev
# -> Frontend running on http://localhost:9710
```

브라우저에서 `http://localhost:9710`으로 접속하여 서비스를 이용할 수 있습니다.

---

## 4. 주요 기능 (Core Features)

1. **행사 탐색 및 실시간 검색**
   - 개발, 디자인, 비즈니스, AI, 마케팅, 네트워킹 등 6대 카테고리 필터.
   - 키워드 실시간 검색 및 온/오프라인 행사 구분 배지.
   - 조기 마감 위험도 표시 및 잔여 좌석 프로그레스 바.
2. **참가 신청 및 전자 티켓 발급**
   - STANDARD, VIP, EARLY_BIRD 등 다단계 티켓 등급 선택.
   - 신청 인원수(1~5명) 및 대표 신청자/참석자 정보 입력.
   - 신청 완료 시 고유 예약 번호 및 전자 티켓 바코드/QR UI 즉시 생성.
3. **나의 참가권 (My Passes) 관리**
   - 로그인한 사용자별 보유 참가권 목록 확인.
   - 참석자 이름 및 연락처 인라인/모달 수정 기능.
   - 참가 신청 취소 및 실시간 상태(CONFIRMED, CANCELLED) 갱신.
4. **사용자 스위칭**
   - 다양한 시나리오 검증을 위한 헤더 내 사용자 전환 (16명 사전 등록 사용자).

---

## 5. 백엔드 REST API 명세 (Backend API)

- `GET /api/health` : 서버 상태 점검
- `GET /api/users` : 사용자 목록 조회
- `GET /api/categories` : 행사 카테고리 목록 조회
- `GET /api/events` : 행사 목록 조회 (`category`, `search` 쿼리 지원)
- `GET /api/events/:id` : 특정 행사 상세 정보 조회
- `GET /api/registrations?user_id=:id` : 사용자별 참가 신청 목록 조회
- `GET /api/registrations/:id` : 참가 신청 상세 정보 조회
- `POST /api/registrations` : 신규 행사 참가 신청 등록
- `PUT /api/registrations/:id` : 참가 신청 정보(참석자명, 연락처 등) 수정
- `POST /api/registrations/:id/cancel` : 참가 신청 취소
- `POST /api/test/reset` : 전체 데이터베이스 원본 시드 상태로 멱등 초기화

---

## 6. DQN Unseen Evaluation (버그 명세)

본 사이트에는 강화학습 에이전트(DQN)의 미지의 환경(Unseen Test) 탐색 및 오류 검증 행동을 측정하기 위해 5가지의 의도적인 불일치 버그가 설계되어 있습니다.
일반 사용자의 화면 UI 및 DOM에는 버그 힌트가 일절 노출되지 않으며, 상세한 결함 목록 및 재현 단계는 [`BUGS.md`](./BUGS.md) 문서를 참조하십시오.
