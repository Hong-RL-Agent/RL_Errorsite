# StudyFlash

**사이트 이름:** StudyFlash  
**사이트 ID:** site079  
**포트:** 9408  

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 백엔드 | Node.js, Express |
| 프론트엔드 | HTML5, Vanilla CSS, Vanilla JS |
| DB | In-memory Mock DB (JavaScript Object/Array) |
| 폰트 | Plus Jakarta Sans (Google Fonts) |

---

## 실행 방법

```bash
cd site079
npm install
npm start
```

브라우저에서 `http://localhost:9408` 접속

---

## API 엔드포인트 목록

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/decks` | 공개 덱 목록 (tag, q 필터) |
| GET | `/api/decks/:id` | 덱 상세 (⚠️ bug03: 비공개 덱도 응답) |
| GET | `/api/cards/:deckId` | 덱의 전체 카드 목록 |
| GET | `/api/cards/:deckId/:cardIndex` | 카드 한 장 (⚠️ bug02: 랜덤 지연) |
| GET | `/api/progress/:deckId` | 진행률 조회 |
| POST | `/api/progress` | 진행률 저장 (⚠️ bug01: 실제 저장 안 됨) |
| GET | `/api/wrong-notes` | 오답 노트 목록 |
| POST | `/api/wrong-notes` | 오답 노트 추가 |
| DELETE | `/api/wrong-notes/:id` | 오답 노트 삭제 |
| GET | `/api/tags` | 태그 목록 |

---

## 정상 작동 기능 목록

1. **덱 검색** — 이름/설명/태그 키워드 실시간 검색
2. **태그 필터** — 영어, 역사, CS, 수학, 지리 등 태그 칩 선택
3. **덱 상세 모달** — 카드 목록 및 덱 정보 탭 전환
4. **학습 모드 시작** — 덱 선택 → 플래시카드 순서 학습
5. **카드 넘기기** — 앞면(질문) → 뒷면(정답) 전환
6. **정답/오답 체크** — 맞았음/틀렸음 버튼으로 세션 점수 기록
7. **오답 노트 자동 추가** — 틀린 카드 자동 저장
8. **오답 노트 삭제** — 오답 노트 항목 개별 삭제
9. **진행률 조회** — 덱별 학습 완료율, 정답률 시각화
10. **새로고침** — 헤더 새로고침 버튼으로 전체 데이터 갱신
11. **탭 전환** — 사이드바 5개 뷰 전환 (덱, 학습, 오답, 진행률, 프로필)
12. **학습 완료 화면** — 결과 요약 및 다시 학습/홈 복귀
13. **프로필 설정 토글** — 알림, 테마, 자동저장 스위치
14. **모달 닫기** — ✕, 오버레이 클릭, ESC 키

---

## 의도된 오류 3개 요약

### bug01 — DB 진행률 저장 오류 (database-persistence)
- `POST /api/progress` 가 성공 응답을 반환하나 in-memory DB에 실제로 저장하지 않음
- 학습 완료 후 재조회 시 이전 진행률이 그대로 유지됨

### bug02 — 네트워크 응답 순서 오류 (network-race-condition)
- `GET /api/cards/:deckId/:cardIndex` 에 0~800ms 랜덤 지연 삽입
- 빠른 카드 전환 시 이전 카드 응답이 현재 카드 슬롯을 덮어쓸 수 있음

### bug03 — 비공개 덱 접근 제어 실패 (security-access-control)
- `GET /api/decks/:id` 에서 `isPrivate` 및 소유자 검증 없이 응답
- deckId(4)를 알면 비공개 덱 정보 및 카드를 누구나 조회 가능

---

## 참고 문서

- **BUGS.md** — 의도된 오류 3개 상세 문서화
- **TODO.md** — 구현 현황 체크리스트
