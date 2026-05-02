# BUGS.md — site079 StudyFlash

> PPO 에이전트 학습을 위해 의도적으로 삽입된 오류 문서

---

## bug01

| 항목 | 내용 |
|------|------|
| **bugId** | site079-bug01 |
| **CSV 오류명** | DB 진행률 저장 오류 |
| **type** | database-persistence |
| **발생 위치** | `server.js` — `POST /api/progress` 핸들러 |
| **관련 파일** | `server.js` |
| **data-bug-id selector** | `[data-bug-id="site079-bug01"]` |

### 사용자가 경험하는 증상
- 학습 완료 후 `POST /api/progress` 요청이 `{ success: true }` 를 반환하므로 오류가 없어 보임
- 하지만 `GET /api/progress/:deckId` 재조회 시 진행률이 학습 전과 동일하게 유지됨
- 진행률 뷰에서 "학습 완료 후에도 0% 그대로" 상태가 지속됨

### 코드상 의도된 원인
```javascript
// server.js — POST /api/progress
app.post('/api/progress', (req, res) => {
  // data-bug-id="site079-bug01"
  // progressDB 저장 로직이 주석 처리되어 실행되지 않음
  // const key = `${CURRENT_USER}_${deckId}`;
  // progressDB[key] = { ... };  ← 이 줄이 없음

  res.json({ success: true, message: '진행률이 저장되었습니다.', data: { ... } });
});
```

### PPO 에이전트가 탐지해야 할 기대 행동
- `POST /api/progress` 후 즉시 `GET /api/progress/:deckId` 로 재조회하여 값 일치 여부 확인
- 요청 body의 `studied` 값과 응답 후 재조회 값이 다르면 database-persistence 오류로 플래그
- 성공 응답(200)임에도 상태가 변하지 않는 패턴 탐지

---

## bug02

| 항목 | 내용 |
|------|------|
| **bugId** | site079-bug02 |
| **CSV 오류명** | 네트워크 응답 순서 오류 |
| **type** | network-race-condition |
| **발생 위치** | `server.js` — `GET /api/cards/:deckId/:cardIndex` 핸들러 |
| **관련 파일** | `server.js` |
| **data-bug-id selector** | `[data-bug-id="site079-bug02"]` |

### 사용자가 경험하는 증상
- 빠르게 카드를 넘길 때 화면에 표시되는 카드가 현재 인덱스와 다른 카드일 수 있음
- 예: 3번 카드를 요청했으나 1번 카드의 늦게 도착한 응답이 화면을 덮어쓰는 현상

### 코드상 의도된 원인
```javascript
// server.js — randomDelay()
// data-bug-id="site079-bug02"
function randomDelay() {
  return new Promise(resolve => setTimeout(resolve, Math.random() * 800));
}

app.get('/api/cards/:deckId/:cardIndex', async (req, res) => {
  await randomDelay(); // 0~800ms 랜덤 지연
  res.json({ ... });
});
```
- 서버가 요청마다 임의의 지연을 삽입
- 클라이언트가 이전 요청을 취소(AbortController)하지 않으므로 오래된 응답이 최신 UI를 덮어씀

### PPO 에이전트가 탐지해야 할 기대 행동
- 연속 요청 시 응답 순서가 요청 순서와 다를 때 탐지
- 응답의 `index` 필드와 실제 현재 카드 인덱스를 비교하여 불일치 감지
- 응답 시간 편차가 크고(0~800ms) 순서가 역전되는 경우 network-race-condition 플래그

---

## bug03

| 항목 | 내용 |
|------|------|
| **bugId** | site079-bug03 |
| **CSV 오류명** | 비공개 덱 접근 제어 실패 |
| **type** | security-access-control |
| **발생 위치** | `server.js` — `GET /api/decks/:id` 핸들러 |
| **관련 파일** | `server.js` |
| **data-bug-id selector** | `[data-bug-id="site079-bug03"]` |

### 사용자가 경험하는 증상
- 덱 목록(`GET /api/decks`)에서는 비공개 덱(id:4)이 보이지 않음
- 하지만 `GET /api/decks/4` 를 직접 호출하면 비공개 덱 정보가 전부 반환됨
- `GET /api/cards/4` 도 인증 없이 카드 내용 전체 조회 가능

### 코드상 의도된 원인
```javascript
// server.js — GET /api/decks/:id
app.get('/api/decks/:id', (req, res) => {
  const deck = mockDecks.find(d => d.id === deckId);
  // data-bug-id="site079-bug03"
  // isPrivate 및 소유자(owner) 검증 로직이 전혀 없음
  // 정상 코드:
  // if (deck.isPrivate && deck.owner !== CURRENT_USER) {
  //   return res.status(403).json({ success: false, message: '접근 권한이 없습니다.' });
  // }
  res.json({ success: true, data: deck }); // 비공개 덱도 그대로 반환
});
```

### PPO 에이전트가 탐지해야 할 기대 행동
- `GET /api/decks/4` 요청 시 `isPrivate: true`인 덱이 200으로 응답되면 security-access-control 오류 탐지
- 403 Forbidden이 아닌 200 OK로 비공개 리소스가 반환될 때 플래그
- 목록 API에서 노출되지 않는 리소스가 직접 ID 접근으로 조회 가능한 IDOR(Insecure Direct Object Reference) 패턴 탐지
