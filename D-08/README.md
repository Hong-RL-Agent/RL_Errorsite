# TeamOrbit - 팀 업무 협업 및 칸반 보드 서비스 (D-08)

TeamOrbit은 소프트웨어 개발 및 프로덕트 팀을 위한 실시간 팀 업무 협업, 프로젝트 관리 및 칸반 보드 웹 플랫폼입니다.  
Notion, Jira, Trello와 같은 전문 협업 서비스의 정보 구조와 워크스페이스 개념을 기반으로 독자적인 UI/UX와 컴포넌트 아키텍처로 구현되었습니다.

본 프로젝트는 **Frontend (Next.js 14)**와 **Backend (Node.js + Express + SQLite)**가 독립된 프로세스로 실행되며 실제 REST API 통신 및 멱등성 상태 리셋을 완벽하게 지원합니다.

---

## 1. 프로젝트 구조

```
D-08/
├── backend/                       # REST API 백엔드 서버 (Node.js + Express + SQLite)
│   ├── .env                       # 서버 환경변수 (포트 9808)
│   ├── package.json               # express, sqlite3, cors, dotenv 의존성
│   ├── db.js                      # 6개 프로젝트, 18명 팀원, 54개 업무, 45개 댓글 시드 및 resetAllData()
│   ├── server.js                  # Express REST API 라우터 및 5대 의도적 오류 로직
│   └── teamorbit.db               # SQLite 데이터베이스 파일 (자동 생성)
├── frontend/                      # 프론트엔드 웹 애플리케이션 (Next.js 14 App Router)
│   ├── package.json               # next, react, react-dom, lucide-react
│   ├── next.config.js             # 포트 9708 바인딩 및 /api -> 9808 rewrites 설정
│   └── src/
│       ├── app/
│       │   ├── layout.jsx         # 루트 레이아웃 (Pretendard 폰트 및 메타데이터)
│       │   ├── page.jsx           # 메인 대시보드 (프로젝트 선택, 필터, 보드/리스트 뷰 조립)
│       │   └── globals.css        # 밝은 회색 및 퍼플 포인트 테마, 칸반/테이블 CSS
│       ├── components/
│       │   ├── Header.jsx         # 상단 헤더 (뷰 모드 전환, 새 업무, 설정, 초기화)
│       │   ├── Sidebar.jsx        # 프로젝트 스페이스 전환기 및 팀원 목록
│       │   ├── KanbanBoard.jsx    # 4단계 칸반 컬럼 (TODO, IN_PROGRESS, REVIEW, DONE)
│       │   ├── TaskCard.jsx       # 개별 업무 카드 (키, 우선순위, 담당자, 완료 토글)
│       │   ├── TaskListView.jsx   # 업무 목록 테이블 뷰 (정렬, 상세, 상태 변경)
│       │   ├── TaskDetailDrawer.jsx # 업무 상세 슬라이드오버 (속성 편집, 댓글 작성/삭제)
│       │   ├── NewTaskModal.jsx   # 새 업무 카드 생성 모달
│       │   ├── NewProjectModal.jsx # 새 프로젝트 스페이스 생성 모달
│       │   ├── ProjectSettingsModal.jsx # 프로젝트 알림 환경설정 모달 [BUG-D08-05 연동]
│       │   └── ActivityLogModal.jsx # 프로젝트 활동 타임라인 로그 모달
│       └── lib/
│           └── api.js             # Fetch 기반 REST API 클라이언트 모듈
├── BUGS.md                        # DQN 검증 전략 5대 의도적 오류 상세 명세서
└── README.md                      # 프로젝트 실행 및 API 명세 문서
```

---

## 2. 포트 및 접속 URL

| 서비스 | 할당 포트 | URL | 비고 |
|--------|-----------|-----|------|
| **Frontend** | **9708** | `http://localhost:9708` | Next.js 14 웹 애플리케이션 |
| **Backend** | **9808** | `http://localhost:9808` | Express REST API 서버 |

- Next.js 프론트엔드 서버는 `next.config.js`의 `rewrites` 설정을 통해 `/api/:path*` 요청을 백엔드 `http://localhost:9808/api/:path*`로 자동 프록시합니다.

---

## 3. 설치 및 실행 가이드

### 1) 백엔드 서버 실행
```bash
cd "C:\Users\User\Desktop\errorsite\D-08\backend"
npm install
npm start
# 또는 node server.js
```
- 백엔드 서버 기동 시 `http://localhost:9808`에서 REST API가 활성화됩니다.
- 첫 기동 시 `teamorbit.db`에 6개 프로젝트, 18명 팀원, 54개 업무 카드가 자동 시딩됩니다.

### 2) 프론트엔드 개발 서버 실행
```bash
cd "C:\Users\User\Desktop\errorsite\D-08\frontend"
npm install
npm run dev
```
- 브라우저에서 `http://localhost:9708`로 접속하여 TeamOrbit 웹 애플리케이션을 사용합니다.

---

## 4. 핵심 REST API 명세

| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| `GET` | `/api/projects` | 전체 프로젝트 목록 조회 |
| `POST` | `/api/projects` | 신규 프로젝트 생성 |
| `PATCH` | `/api/projects/:id/settings` | 프로젝트 알림 환경설정 저장 [BUG-D08-05] |
| `GET` | `/api/members` | 전체 팀원 목록 조회 |
| `POST` | `/api/members` | 신규 팀원 등록 |
| `GET` | `/api/tasks?projectId=&priority=&assignee=&search=` | 업무 목록 조건별 조회 |
| `GET` | `/api/tasks/:id` | 업무 단건 상세 및 댓글 목록 조회 |
| `POST` | `/api/tasks` | 신규 업무 카드 생성 |
| `PATCH` | `/api/tasks/:id/status` | 업무 상태 변경 [BUG-D08-01, BUG-D08-04] |
| `PATCH` | `/api/tasks/:id/assignee` | 업무 담당자 변경 [BUG-D08-03] |
| `PATCH` | `/api/tasks/:id` | 업무 상세 정보 (제목, 설명, 마감일 등) 수정 |
| `POST` | `/api/tasks/:id/comments` | 업무 댓글 등록 |
| `DELETE` | `/api/comments/:id` | 댓글 삭제 [BUG-D08-02] |
| `GET` | `/api/projects/:id/activities` | 프로젝트 활동 타임라인 로그 조회 |
| `POST` | `/api/test/reset` | SQLite DB 및 모든 상태를 초기 시드 상태로 완전 복원 |

---

## 5. 의도적 오류 요약 (BUGS.md 참조)

1. **BUG-D08-01 [ACTION_REPLAY]**: 특정 업무(ID 14, `MOB-105`)에 대해 완료 버튼 클릭 시 DB UPDATE가 누락되어 진행 중으로 유지되는 오류
2. **BUG-D08-02 [ACTION_REPLAY]**: 댓글 9번 삭제 요청 시 요청한 9번 대신 8번 댓글이 삭제되는 왜곡 오류
3. **BUG-D08-03 [SEQUENCE_REPLAY]**: 프로젝트 1번 + 최영진 필터 적용 상태에서 업무 3번 담당자 변경 시 1번 업무의 담당자가 변조되는 다단계 시퀀스 오류
4. **BUG-D08-04 [SEQUENCE_REPLAY]**: 프로젝트 3번 + URGENT 필터 적용 상태에서 업무 21번 상태 변경 시 DB 영속화가 생략되는 다단계 시퀀스 오류
5. **BUG-D08-05 [STATE_REVISIT]**: 프로젝트 4번(Orbit Design System)의 알림 환경설정 변경 후 다른 프로젝트 이동 뒤 재입장 시 미설정 상태로 복원되는 오류
