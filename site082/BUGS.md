# BUGS.md — site082 GarageSale Map

## bug01
| 항목 | 내용 |
|------|------|
| **bugId** | site082-bug01 |
| **CSV 오류명** | DB 날짜 정렬 오류 |
| **type** | database-sort |
| **발생 위치** | `server.js` — `GET /api/markets` sort=date 처리 |
| **data-bug-id** | `[data-bug-id="site082-bug01"]` |

### 증상
- `sort=date` 요청 시 "2026-9-20", "2026-10-5" 등 패딩 없는 날짜가 문자열 비교로 잘못 정렬됨
- 문자열로 "9" > "1"이므로 9월이 10월보다 뒤로 밀리는 역전 발생

### 원인
```javascript
// data-bug-id="site082-bug01"
markets.sort((a, b) => a.date.localeCompare(b.date));
// 정상: (a, b) => new Date(a.date) - new Date(b.date)
```

### PPO 탐지 기대
- `sort=date` 응답의 날짜 순서가 실제 시간순과 불일치 시 database-sort 플래그

---

## bug02
| 항목 | 내용 |
|------|------|
| **bugId** | site082-bug02 |
| **CSV 오류명** | 네트워크 위치 데이터 손상 |
| **type** | network-partial-response |
| **발생 위치** | `server.js` — `mockMarkets` id:1, id:4 |
| **data-bug-id** | `[data-bug-id="site082-bug02"]` |

### 증상
- id:1(망원 한강 플리마켓), id:4(성수 감성 수공예) 의 `lat`, `lng`가 `null`로 응답
- 지도 카드에서 해당 마켓의 핀이 정확한 위치에 표시되지 않음

### 원인
```javascript
// data-bug-id="site082-bug02"
{ id: 1, lat: null, lng: null, ... }  // 의도적 null
{ id: 4, lat: null, lng: null, ... }  // 의도적 null
```

### PPO 탐지 기대
- 응답 JSON에서 `lat === null || lng === null`인 레코드 비율과 id 목록 보고

---

## bug03
| 항목 | 내용 |
|------|------|
| **bugId** | site082-bug03 |
| **CSV 오류명** | 참가 신청 인증 우회 |
| **type** | security-authentication |
| **발생 위치** | `server.js` — `POST /api/applications` |
| **data-bug-id** | `[data-bug-id="site082-bug03"]` |

### 증상
- `x-user-id: admin` 헤더를 임의로 설정하여 신청하면 서버가 해당 userId를 그대로 신뢰
- JWT/세션 검증 없이 헤더 값만으로 신원 위조 가능

### 원인
```javascript
// data-bug-id="site082-bug03"
const userId = req.headers['x-user-id'] || 'anonymous';
// 정상: const userId = verifyJWT(req.headers.authorization);
```

### PPO 탐지 기대
- `x-user-id` 헤더 위조 후 201 응답과 함께 위조된 userId가 응답에 포함되면 security-authentication 플래그
