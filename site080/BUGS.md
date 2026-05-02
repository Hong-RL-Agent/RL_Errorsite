# BUGS.md — site080 RoomMate Board

> PPO 에이전트 학습을 위해 의도적으로 삽입된 오류 문서

---

## bug01

| 항목 | 내용 |
|------|------|
| **bugId** | site080-bug01 |
| **CSV 오류명** | DB 게시글 상태 오류 |
| **type** | database-state |
| **발생 위치** | `server.js` — `getPostStatus_buggy()`, `GET /api/posts`, `GET /api/posts/:id` |
| **관련 파일** | `server.js` |
| **data-bug-id selector** | `[data-bug-id="site080-bug01"]` |

### 사용자가 경험하는 증상
- `isClosed: true`인 게시글(id: 2, 4)도 모집중(`status: 'open'`)으로 표시됨
- "🟢 모집중" 배지가 마감된 게시글에 동일하게 나타남
- 모달의 신청 탭에서 마감 게시글에도 신청 폼이 활성화됨
- 실제 DB 상태(`isClosed`)와 API 응답(`status`)이 불일치

### 코드상 의도된 원인
```javascript
// server.js — getPostStatus_buggy()
// data-bug-id="site080-bug01"
function getPostStatus_buggy(post) {
  // isClosed 필드를 확인하지 않고 무조건 'open' 반환
  // 정상 로직: return post.isClosed ? 'closed' : 'open';
  return 'open';
}
```

### PPO 에이전트가 탐지해야 할 기대 행동
- `/api/posts` 응답에서 `isClosed: true`인 레코드의 `status` 필드가 `'open'`이면 database-state 오류로 플래그
- `isClosed`와 `status` 필드의 논리적 불일치 탐지
- 마감 게시글에 신청 가능한 상태로 제공되는지 확인

---

## bug02

| 항목 | 내용 |
|------|------|
| **bugId** | site080-bug02 |
| **CSV 오류명** | 네트워크 응답 지연 처리 실패 |
| **type** | network-timeout |
| **발생 위치** | `server.js` — `POST /api/applications` 핸들러 |
| **관련 파일** | `server.js` |
| **data-bug-id selector** | `[data-bug-id="site080-bug02"]` |

### 사용자가 경험하는 증상
- 신청 버튼 클릭 후 응답까지 4초 이상 대기 상태 지속
- 서버 측에서 명확한 타임아웃 처리나 오류 반환 없음
- 클라이언트 타임아웃(6초)을 초과하면 에러 메시지가 표시되나, 서버는 계속 처리 중일 수 있음
- 중복 신청이 발생할 수 있음 (재시도 시)

### 코드상 의도된 원인
```javascript
// server.js — POST /api/applications
// data-bug-id="site080-bug02"
app.post('/api/applications', async (req, res) => {
  // 4초 인위적 지연 — 서버 타임아웃 처리 없음
  await artificialDelay(4000);
  // 정상적으로는 Promise.race([dbSave(), timeout(3000)])으로 처리해야 함
  res.status(201).json({ success: true, data: newApp });
});
```

### PPO 에이전트가 탐지해야 할 기대 행동
- `POST /api/applications` 응답 시간이 3초를 초과하면 network-timeout 오류로 플래그
- 응답 시간(TTFB) 측정 시 4000ms 이상 소요 탐지
- 서버가 타임아웃 응답(408 Request Timeout)을 반환하지 않는 경우 감지

---

## bug03

| 항목 | 내용 |
|------|------|
| **bugId** | site080-bug03 |
| **CSV 오류명** | 개인 메시지 접근 제어 실패 |
| **type** | security-idor |
| **발생 위치** | `server.js` — `GET /api/messages/:threadId` 핸들러 |
| **관련 파일** | `server.js` |
| **data-bug-id selector** | `[data-bug-id="site080-bug03"]` |

### 사용자가 경험하는 증상
- 현재 사용자(user_kim)는 `thread_1_A` 스레드에만 참여하지만
- `GET /api/messages/thread_3_B`, `GET /api/messages/thread_4_X` 등 임의 threadId로 타 사용자의 메시지 전체 조회 가능
- 메시지 탭의 "IDOR 테스트" 패널에서 `thread_4_X` 입력 시 다른 사용자 대화 노출
- 403 Forbidden 없이 200 OK로 개인 메시지가 반환됨

### 코드상 의도된 원인
```javascript
// server.js — GET /api/messages/:threadId
// data-bug-id="site080-bug03"
app.get('/api/messages/:threadId', (req, res) => {
  const thread = mockMessages[threadId];
  // 참여자 검증 로직 완전 누락
  // 정상 코드:
  // if (!thread.participants.includes(CURRENT_USER)) {
  //   return res.status(403).json({ success: false, message: '접근 권한이 없습니다.' });
  // }
  res.json({ success: true, data: thread }); // IDOR: 누구나 조회 가능
});
```

### PPO 에이전트가 탐지해야 할 기대 행동
- 현재 사용자가 참여하지 않은 threadId로 요청 시 403이 아닌 200이 반환되면 security-idor 플래그
- 응답 데이터의 `participants` 배열에 현재 사용자가 없는데 메시지가 반환되는 IDOR 패턴 탐지
- 순차적 threadId 변경으로 타 사용자 데이터가 노출되는지 확인
