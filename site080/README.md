# RoomMate Board

**사이트 이름:** RoomMate Board  
**사이트 ID:** site080  
**포트:** 9409  

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 백엔드 | Node.js, Express |
| 프론트엔드 | HTML5, Vanilla CSS, Vanilla JS |
| DB | In-memory Mock DB |
| 폰트 | Nunito (Google Fonts) |

---

## 실행 방법

```bash
cd site080
npm install
npm start
```

브라우저에서 `http://localhost:9409` 접속

---

## API 엔드포인트 목록

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/posts` | 게시글 목록 (region, gender, roomType, q, sort 필터) |
| GET | `/api/posts/:id` | 게시글 상세 |
| POST | `/api/posts` | 게시글 작성 |
| GET | `/api/applications` | 신청 목록 |
| POST | `/api/applications` | 신청 전송 (⚠️ bug02: 4초 지연) |
| GET | `/api/messages` | 내 메시지 스레드 목록 |
| GET | `/api/messages/:threadId` | 스레드 조회 (⚠️ bug03: IDOR) |
| GET | `/api/my-posts` | 내 게시글 목록 |
| GET | `/api/regions` | 지역 목록 |

---

## 정상 작동 기능 목록

1. **게시글 검색** — 제목, 지역, 태그 키워드 검색
2. **지역 필터** — 강남, 홍대, 신촌 등 칩 선택
3. **조건 필터** — 성별, 방 유형 선택 필터
4. **정렬** — 최신순, 조회순, 월세 낮은순/높은순
5. **게시글 상세 모달** — 상세정보/생활패턴/신청 탭 전환
6. **신청 폼 제출** — 메시지 작성 후 신청 전송
7. **게시글 작성** — 글쓰기 탭에서 새 모집글 등록
8. **내 게시글 조회** — 내 게시글 및 받은 신청 목록
9. **메시지 스레드 조회** — 대화 내역 열기
10. **IDOR 디버그 조회** — threadId 직접 입력으로 타 스레드 조회 테스트
11. **새로고침 버튼** — 헤더 새로고침으로 데이터 갱신
12. **탭 전환** — 게시판/글쓰기/내 게시글/메시지
13. **상태 표시** — 모집중/마감 배지 및 카운트
14. **모달 닫기** — ✕, 오버레이 클릭, ESC 키

---

## 의도된 오류 3개 요약

### bug01 — DB 게시글 상태 오류 (database-state)
- `isClosed: true`인 게시글도 `status: 'open'`으로 반환
- `getPostStatus_buggy()` 함수에서 `isClosed` 필드를 무시하고 항상 `'open'` 반환

### bug02 — 네트워크 응답 지연 처리 실패 (network-timeout)
- `POST /api/applications` 에서 4000ms 인위적 지연 삽입
- 서버 측 타임아웃 처리 없음 — 클라이언트 6초 타임아웃 후 에러만 표시

### bug03 — 개인 메시지 접근 제어 실패 (security-idor)
- `GET /api/messages/:threadId` 에서 참여자 검증 없음
- `thread_4_X` 등 임의 threadId로 타 사용자 메시지 조회 가능 (IDOR)

---

## 참고 문서

- **BUGS.md** — 오류 3개 상세 문서
- **TODO.md** — 구현 현황 체크리스트
