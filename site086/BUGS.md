# BUGS.md — site086 FestivalFood

## bug01
| 항목 | 내용 |
|------|------|
| **bugId** | site086-bug01 |
| **CSV 오류명** | DB 쿠폰 사용 상태 오류 |
| **type** | database-state |
| **발생 위치** | `server.js` — `POST /api/coupons/:id/use` |
| **data-bug-id** | `[data-bug-id="site086-bug01"]` |

### 증상
- 쿠폰 사용 요청 시 200 성공 응답이 오지만 `used` 필드가 여전히 `false`
- `GET /api/coupons` 재조회 시 여전히 미사용 상태
- 동일 쿠폰을 무한정 반복 사용 가능

### 원인
```javascript
// data-bug-id="site086-bug01"
// coupon.used = true;  ← 의도적으로 주석 처리
// 서버 메모리 내 상태가 변경되지 않음
```

### PPO 탐지 기대
- `POST /api/coupons/:id/use` 응답의 `used === false` 이면 database-state 플래그
- 동일 쿠폰 재사용 시 400이 아닌 200 반환되면 감지

---

## bug02
| 항목 | 내용 |
|------|------|
| **bugId** | site086-bug02 |
| **CSV 오류명** | 네트워크 오래된 대기시간 |
| **type** | network-stale-data |
| **발생 위치** | `server.js` — `GET /api/wait-times` |
| **data-bug-id** | `[data-bug-id="site086-bug02"]` |

### 증상
- `/api/wait-times` 응답의 `snapshotAt`이 이틀 전(`2026-04-30T09:00:00Z`)으로 고정
- 서버를 새로 시작해도 대기시간 값이 동일
- 응답에 `"note": "Data may be stale"` 경고가 있어도 수정하지 않음

### 원인
```javascript
// data-bug-id="site086-bug02"
const WAIT_TIMES_SNAPSHOT_AT = '2026-04-30T09:00:00Z'; // 하드코딩된 stale 타임스탬프
// 정상: snapshotAt: new Date().toISOString()  + 주기적 갱신 로직
```

### PPO 탐지 기대
- `snapshotAt` 과 현재 시간의 차이가 임계값 초과 시 network-stale-data 플래그
- 반복 호출 시 값이 변하지 않는 패턴 감지

---

## bug03
| 항목 | 내용 |
|------|------|
| **bugId** | site086-bug03 |
| **CSV 오류명** | 쿠폰 소유자 검증 누락 |
| **type** | security-authorization |
| **발생 위치** | `server.js` — `POST /api/coupons/:id/use` |
| **data-bug-id** | `[data-bug-id="site086-bug03"]` |

### 증상
- `POST /api/coupons/3/use` → `user_guest`의 쿠폰 사용 성공
- `POST /api/coupons/4/use` → `user_vip`의 VIP 전용 쿠폰 사용 성공
- 쿠폰 탭 bug03 패널에서 id 3, 4 입력으로 재현

### 원인
```javascript
// data-bug-id="site086-bug03"
// coupon.userId !== CURRENT_USER 검증 없음
// 정상: if (coupon.userId !== CURRENT_USER) return res.status(403)...
```

### PPO 탐지 기대
- 현재 사용자 소유가 아닌 쿠폰 id로 사용 요청 시 200 반환이면 security-authorization 플래그
