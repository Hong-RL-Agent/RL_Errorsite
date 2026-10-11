# SkillOrbit (B-10)

SkillOrbit은 온라인 강의 수강, 학습 진도, 과제 제출, 수료증 관리를 제공하는 Unseen Test용 온라인 클래스 플랫폼입니다.

- 사이트 ID: B-10
- 용도: Unseen Test
- 확인전략: SEQUENCE_REPLAY + STATE_REVISIT + ACTION_REPLAY
- 기술 스택: Next.js App Router, React, Node.js, Express, SQLite

## 프로젝트 구조

```text
siteB10_온라인클래스/
├─ frontend/
└─ backend/
```

## 실행 방법

Backend:

```bash
cd siteB10_온라인클래스/backend
npm install
npm run dev
```

Frontend:

```bash
cd siteB10_온라인클래스/frontend
npm install
npm run dev
```

- Frontend: `http://localhost:5325`
- Backend: `http://localhost:9724`

## 정상 기능

강의 검색, 카테고리/난이도 필터, 인기순/최신순 정렬, 강의 상세, 강사 프로필, 수강 신청/취소, 내 강의, 강의 목차, 콘텐츠 열기, 재생/일시정지, 학습 완료, 진도 저장/조회, 메모 작성/수정/삭제, 자료 목록, 퀴즈 응시/제출, 과제 제출/수정/취소, 수료 조건 확인, 수료증 발급/조회, 학습 알림, 활동 로그, Reset을 구현했습니다.

## API 엔드포인트

```text
GET    /api/health
GET    /api/courses
GET    /api/courses/:id
GET    /api/courses/:id/syllabus
GET    /api/instructors
GET    /api/instructors/:id
GET    /api/learners
GET    /api/learners/:id
GET    /api/enrollments
POST   /api/enrollments
DELETE /api/enrollments/:id
GET    /api/lessons/:id
GET    /api/lessons/:id/slides
GET    /api/learning-progress
POST   /api/learning-progress
PATCH  /api/learning-progress/:id
GET    /api/study-notes
POST   /api/study-notes
PATCH  /api/study-notes/:id
DELETE /api/study-notes/:id
GET    /api/quizzes
GET    /api/quizzes/:id
POST   /api/quizzes/:id/submissions
GET    /api/assignments
GET    /api/assignments/:id
POST   /api/assignments/:id/submissions
PATCH  /api/assignments/:id/submissions/:submissionId
DELETE /api/assignments/:id/submissions/:submissionId
GET    /api/completion-rules/:courseId
GET    /api/completion-status/:courseId
GET    /api/certificates
POST   /api/certificates
GET    /api/learning-activity
GET    /api/notifications
POST   /api/test/reset
```

## 의도적 오류 5개

1. `B10-ERR01`: 필수 학습 단계 우회
2. `B10-ERR02`: 과제 제출 취소 후 상태 일부 잔존
3. `B10-ERR03`: 학습 슬라이드 페이지 정보 누락
4. `B10-ERR04`: 학습 메모 저장 후 재접속 시 이전 값 표시
5. `B10-ERR05`: 강의 완료 후 진도율 요약 캐시 불일치

## 재현 시나리오

- `B10-ERR01`: 첫 학습 콘텐츠만 완료한 뒤 목차에서 `수료 확인`을 누르면 수료 화면으로 이동하지만, Backend의 수료증 발급은 조건 미충족으로 거부됩니다.
- `B10-ERR02`: 과제 답안과 첨부 자료를 입력하고 미리보기 후 `제출 취소`를 누르면 답안만 초기화되고 첨부 요약은 남습니다.
- `B10-ERR03`: 슬라이드에서 다음/이전 이동은 되지만 현재 페이지 번호와 전체 개수 표시가 없습니다.
- `B10-ERR04`: `C0002` 강의 메모를 수정 저장한 뒤 재방문 경로를 사용하면 이전 로컬 캐시 메모가 표시됩니다.
- `B10-ERR05`: 학습 완료 버튼을 누르면 목차 항목은 완료되지만 상단 진도율 요약은 이전 퍼센트를 유지합니다.

## Reset API

`POST /api/test/reset`은 강의, 강사, 수강생, 수강 신청, 진도, 메모, 퀴즈, 과제 제출, 수료증, 알림, 활동 로그를 고정 seed 상태로 복원합니다.

DQN Evidence는 UI, DOM, Network, State 비교를 기준으로 하며 상세 Oracle은 `BUGS.md`, 점검 항목은 `TODO.md`에 정리했습니다.
