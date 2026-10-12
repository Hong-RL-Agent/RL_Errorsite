# PawCare - 반려동물 케어 & 예약 플랫폼 (D-09)

PawCare는 반려동물(반려견, 반려묘)의 미용, 호텔링, 유치원, 아로마 스파&버블목욕, 1:1 행동교정 훈련, 기초 건강검진, 덴탈 스케일링, 실내 어질리티 등 종합 케어 서비스를 편리하게 탐색하고 날짜 및 시간대별로 예약할 수 있는 반려동물 전문 예약 웹 플랫폼입니다.

본 프로젝트는 **Frontend (React + Vite)**와 **Backend (Node.js + Express + SQLite)**가 독립된 프로세스로 실행되며 실제 REST API 통신 및 멱등성 상태 리셋을 완벽하게 지원합니다.

---

## 1. 프로젝트 구조

```
D-09/
├── backend/                       # REST API 백엔드 서버 (Node.js + Express + SQLite)
│   ├── .env                       # 서버 환경변수 (포트 9809)
│   ├── package.json               # express, sqlite3, cors, dotenv 의존성
│   ├── db.js                      # 8명 사용자, 8종 서비스, 16마리 반려동물, 32건 예약 시드 및 resetAllData()
│   ├── server.js                  # Express REST API 라우터 및 5대 의도적 오류 로직 내장
│   └── pawcare.db                 # SQLite 데이터베이스 파일 (자동 생성)
├── frontend/                      # 프론트엔드 웹 애플리케이션 (React 18 + Vite)
│   ├── package.json               # vite, react, react-dom, lucide-react
│   ├── vite.config.js             # 포트 9709 바인딩 및 /api -> 9809 proxy 설정
│   ├── index.html                 # 폰트 및 SPA 템플릿
│   └── src/
│       ├── main.jsx               # React 마운트 진입점
│       ├── App.jsx                # 메인 레이아웃 및 탭/모달 상태 관리
│       ├── index.css              # 파스텔 블루 & 크림 & 코랄 테마 및 카드/바우처 CSS
│       ├── components/
│       │   ├── Header.jsx         # 상단 헤더, 네비게이션 탭, 보호자 전환, 시스템 초기화
│       │   ├── MyPetRoom.jsx      # 반려동물 프로필 카드 룸, 주의사항 및 체중 관리
│       │   ├── ServiceCatalog.jsx # 8종 케어 서비스 안내 카드 컬렉션
│       │   ├── BookingWizard.jsx  # 4단계 예약 신청 위자드 (서비스-펫-달력/시간-견적)
│       │   ├── ReservationList.jsx # 바우처 형태의 예약 내역서 및 상태/서비스 필터
│       │   ├── PetEditModal.jsx   # 반려동물 기본 정보 수정 모달 [BUG-D09-02]
│       │   ├── CareNotesModal.jsx # 돌봄 주의사항 수정 모달 [BUG-D09-05]
│       │   ├── NewPetModal.jsx    # 신규 반려동물 등록 모달
│       │   ├── RescheduleModal.jsx # 예약 일정(날짜/시간) 변경 모달 [BUG-D09-04]
│       │   └── ReceiptModal.jsx   # 바코드 및 상세 비용 분할 영수증 모달
│       └── lib/
│           └── api.js             # Fetch 기반 REST API 클라이언트 모듈
├── BUGS.md                        # Unseen Test DQN 5대 의도적 기능 오류 상세 명세서
└── README.md                      # 프로젝트 실행 및 API 명세 문서
```

---

## 2. 포트 및 접속 URL

| 서비스 | 할당 포트 | URL | 비고 |
|--------|-----------|-----|------|
| **Frontend** | **9709** | `http://localhost:9709` | React + Vite 웹 애플리케이션 |
| **Backend** | **9809** | `http://localhost:9809` | Express REST API 서버 |

- Vite 개발 서버는 `vite.config.js`의 프록시 설정을 통해 `/api/*` 경로의 모든 요청을 백엔드 `http://localhost:9809/api/*`로 자동 전달합니다.

---

## 3. 설치 및 실행 가이드

### 1) 백엔드 서버 실행
```bash
cd "C:\Users\User\Desktop\errorsite\D-09\backend"
npm install
npm start
# 또는 node server.js
```
- 서버 기동 시 `http://localhost:9809`에서 REST API가 활성화됩니다.
- 초기 구동 시 `pawcare.db`에 8명 보호자, 8종 서비스, 16마리 반려동물, 32건 예약 레코드가 자동 적재됩니다.

### 2) 프론트엔드 개발 서버 실행
```bash
cd "C:\Users\User\Desktop\errorsite\D-09\frontend"
npm install
npm run dev
```
- 브라우저에서 `http://localhost:9709`로 접속하여 이용하실 수 있습니다.

---

## 4. 핵심 REST API 명세

| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| `GET` | `/api/users` | 8명 보호자 계정 목록 조회 |
| `GET` | `/api/services` | 8종 케어 서비스 목록 조회 |
| `GET` | `/api/pets?userId=&search=` | 반려동물 목록 조건별 조회 |
| `GET` | `/api/pets/:id` | 반려동물 단건 및 최근 이용 기록 조회 |
| `POST` | `/api/pets` | 신규 반려동물 등록 |
| `PATCH` | `/api/pets/:id` | 반려동물 프로필(체중 등) 수정 [BUG-D09-02] |
| `PATCH` | `/api/pets/:id/care-notes` | 반려동물 돌봄 주의사항 수정 [BUG-D09-05] |
| `GET` | `/api/reservations?userId=&status=&serviceCategory=&search=` | 예약 목록 조건별 조회 |
| `GET` | `/api/reservations/:id` | 예약 단건 상세 영수증 정보 조회 |
| `POST` | `/api/reservations` | 신규 예약 신청 (견적 계산 포함) [BUG-D09-03] |
| `PATCH` | `/api/reservations/:id/cancel` | 예약 취소 [BUG-D09-01] |
| `PATCH` | `/api/reservations/:id/reschedule` | 예약 일정(날짜/시간) 변경 [BUG-D09-04] |
| `POST` | `/api/test/reset` | SQLite DB 및 모든 상태를 초기 시드 상태로 완전 복원 |
| `GET` | `/api/stats` | 전체 반려동물 및 예약 건수 요약 통계 |

---

## 5. 의도적 오류 요약 (BUGS.md 참조)

1. **BUG-D09-01 [ACTION_REPLAY]**: 특정 예약(ID 12, `PAW-2026-012`) 취소 클릭 시 취소 완료 메시지가 나오지만 실제 DB 업데이트가 누락되어 확정 상태가 유지되는 오류
2. **BUG-D09-02 [ACTION_REPLAY]**: 특정 반려동물(ID 4, '초코')의 체중을 수정하면 엉뚱하게 2번 반려동물('보리')의 체중이 변경되는 오류
3. **BUG-D09-03 [SEQUENCE_REPLAY]**: 펫 호텔(Service 2) 선택 후 14:00 시간대를 골라 예약을 확정하면 최종 예약 시간이 16:30으로 왜곡 저장되는 오류
4. **BUG-D09-04 [SEQUENCE_REPLAY]**: 아로마 스파(SPA) 필터 적용 상태에서 예약 16번의 일정을 변경하면 16번 대신 11번 예약의 날짜가 변경되는 오류
5. **BUG-D09-05 [STATE_REVISIT]**: 7번 반려동물('뭉치')의 돌봄 주의사항을 수정 저장한 후 다른 탭으로 이동했다가 재방문하면 이전 주의사항으로 되돌아오는 오류
