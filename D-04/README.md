# BookNest - 도서관 장서 및 대출 관리 시스템 (D-04)

BookNest는 학교 도서관 및 사내 도서관 환경에서 소장 도서 장서를 효율적으로 등록·관리하고, 이용자별 실시간 도서 대출 및 반납 처리를 체계적으로 수행할 수 있는 웹 기반 도서관 관리 플랫폼입니다.  
본 프로젝트는 **Frontend(Next.js 14)**와 **Backend(Node.js + Express + SQLite)**가 완전히 분리된 구조로 동작합니다.

---

## 1. 프로젝트 구조

```
D-04/
├── backend/                       # 백엔드 REST API 서버 (Node.js + Express + SQLite)
│   ├── .env                       # 환경변수 (포트 9804)
│   ├── package.json               # Express, SQLite3, CORS 등 의존성
│   ├── db.js                      # 42권 초기 장서, 12명 이용자, 22건 대출 기록, reset 모듈
│   ├── server.js                  # Express REST API 라우터 및 5대 의도적 오류 로직
│   └── booknest.db                # 실제 SQLite 데이터베이스 파일
├── frontend/                      # 프론트엔드 웹 애플리케이션 (Next.js 14)
│   ├── package.json               # Next.js, React 18, Lucide-react
│   ├── next.config.js             # 포트 9704 설정 및 /api 백엔드 리라이트
│   └── src/
│       ├── app/
│       │   ├── globals.css        # 아이보리 & 다크브라운 클래식 모던 라이브러리 테마
│       │   ├── layout.jsx         # 루트 레이아웃 & 메타데이터
│       │   └── page.jsx           # 메인 대시보드 및 전역 상태 관리
│       ├── components/
│       │   ├── Header.jsx         # 상단 헤더, 탭 전환, 초기화 & 도서 등록
│       │   ├── StatCards.jsx      # 소장 장서, 대출 가능, 대출 중, 이용자 통계 카드
│       │   ├── BookCatalog.jsx    # 도서 검색, 카테고리 필터, 카드 그리드 및 대출/수정/삭제
│       │   ├── LoanManagement.jsx # 대출 및 반납 관리 테이블, 반납 처리 버튼
│       │   ├── UserManagementModal.jsx # 등록 이용자 목록 모달
│       │   ├── AddBookModal.jsx   # 신규 도서 입고 등록 모달
│       │   ├── EditBookModal.jsx  # 도서 정보(제목, 저자, 서가위치, 재고) 수정 모달
│       │   └── BorrowBookModal.jsx # 도서 대출 신청 모달 (이용자 지정)
│       └── lib/
│           └── api.js             # API 클라이언트 모듈
├── BUGS.md                        # 의도적 기능 오류 5종 상세 명세서
└── README.md                      # 프로젝트 실행 및 API 명세 문서
```

---

## 2. 포트 및 접속 URL

| 서비스 | 할당 포트 | URL | 비고 |
|--------|-----------|-----|------|
| **Frontend** | **9704** | `http://localhost:9704` | Next.js 웹 대시보드 |
| **Backend** | **9804** | `http://localhost:9804` | Express REST API 서버 |

- Next.js 프론트엔드는 `/api/*` 경로의 요청을 백엔드 `http://localhost:9804/api/*`로 자동 프록시/리라이트합니다.

---

## 3. 설치 및 실행 가이드

### 사전 요구사항
- Node.js (v18.0.0 이상 권장)
- npm

### 1) 백엔드 서버 실행
```bash
cd "%USERPROFILE%\Desktop\errorsite\D-04\backend"
npm install
npm start
# 또는 npm run dev
```
- 서버가 실행되면 `http://localhost:9804`에서 REST API가 활성화됩니다.
- 초기 구동 시 `booknest.db`에 42권의 대표 도서, 12명의 이용자 회원, 22건의 대출 내역이 자동 적재됩니다.

### 2) 프론트엔드 개발 서버 실행
```bash
cd "%USERPROFILE%\Desktop\errorsite\D-04\frontend"
npm install
npm run dev
```
- 브라우저에서 `http://localhost:9704`로 접속하여 도서관 대시보드를 사용할 수 있습니다.

---

## 4. REST API 엔드포인트 목록

### 시스템 & 테스트 지원
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/health` | 서버 상태 헬스 체크 |
| `POST` | `/api/test/reset` | **DB 상태를 초기 42권 장서 및 22건 대출 상태로 완전 복원 (멱등성)** |
| `GET` | `/api/stats` | 총 도서 수, 대출 가능 수, 대출 중 수량, 이용자 통계 |

### 도서 관리 (Books)
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/books` | 도서 목록 조회 (검색: search, 카테고리: category) |
| `GET` | `/api/books/:id` | 도서 상세 정보 조회 |
| `POST` | `/api/books` | 신규 도서 등록 |
| `PATCH` | `/api/books/:id` | 도서 정보 수정 (`id: 12` 타도서 제목변경, `id: 15` 재고왜곡 버그 발생) |
| `DELETE` | `/api/books/:id` | 도서 삭제 (`id: 8` 삭제 누락 버그 발생) |

### 대출 & 반납 관리 (Loans)
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/loans` | 대출 내역 목록 조회 (필터: status, user_id) |
| `POST` | `/api/loans` | 도서 대출 신청 (`book_id: 3` 재고 미차감 버그 발생) |
| `PATCH` | `/api/loans/:id/return` | 도서 반납 처리 (`id: 5` 상태 유지 버그 발생) |

### 이용자 관리 (Users)
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/users` | 도서관 등록 이용자 및 대출 권수 목록 조회 |

---

## 5. 의도적으로 삽입된 5개 기능 오류 요약 (ACTION_REPLAY)

자세한 재현 시나리오와 Evidence는 `BUGS.md`를 참조하세요.

1. **BUG-D04-01**: `Clean Code 클린 코드` (도서 ID 3) 대출 시 대출 기록은 추가되지만 대출 가능 재고 수량이 감소하지 않고 유지되는 오류
2. **BUG-D04-02**: `총, 균, 쇠` (대출 ID 5) 반납 버튼 클릭 시 성공 알림 후에도 대출 상태('BORROWED')가 그대로 유지되는 오류
3. **BUG-D04-03**: `데미안` (도서 ID 12) 제목 수정 시 `어린 왕자` (도서 ID 11)의 제목이 변경되는 오류
4. **BUG-D04-04**: `사피엔스` (도서 ID 8) 삭제 시 성공 알림 후에도 목록/DB에 그대로 잔류하는 오류
5. **BUG-D04-05**: `객체지향의 사실과 오해` (도서 ID 15) 재고 수량을 수정하면 입력값과 다른 수량(2권)으로 왜곡 반영되는 오류
