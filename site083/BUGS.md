# BUGS.md — site083 SleepCoach

## bug01
| 항목 | 내용 |
|------|------|
| **bugId** | site083-bug01 |
| **CSV 오류명** | DB 수면 시간 계산 오류 |
| **type** | database-calculation |
| **발생 위치** | `server.js` — `calcSleepDuration_buggy()`, `GET /api/sleep-records`, `POST /api/sleep-records` |
| **data-bug-id** | `[data-bug-id="site083-bug01"]` |

### 증상
- 취침 `23:30`, 기상 `07:00` → duration: `-16.5h` (정상: 7.5h)
- 취침 `00:30`, 기상 `08:00` → duration: `7.5h` (패딩으로 우연히 맞음)
- 히스토리 테이블, 수면 바 차트에 음수값 표시

### 원인
```javascript
// data-bug-id="site083-bug01"
function calcSleepDuration_buggy(bedtime, wakeTime) {
  const diff = (wh * 60 + wm) - (bh * 60 + bm); // 자정 초과 시 음수
  return diff / 60; // 정상: if (diff < 0) diff += 24 * 60;
}
```

### PPO 탐지 기대
- `duration < 0`인 레코드 발견 시 database-calculation 플래그
- bedtime > wakeTime(24h 기준) 임에도 음수가 나오는 패턴 검출

---

## bug02
| 항목 | 내용 |
|------|------|
| **bugId** | site083-bug02 |
| **CSV 오류명** | 네트워크 스키마 불일치 |
| **type** | network-schema-mismatch |
| **발생 위치** | `server.js` — `GET /api/stats` |
| **data-bug-id** | `[data-bug-id="site083-bug02"]` |

### 증상
- `/api/stats` 응답에 `averageHours` 키 없음, `avgSleep` 키만 존재
- 프론트엔드의 `s.averageHours` 참조가 `undefined` → 통계 카드에 "N/A" 표시

### 원인
```javascript
// data-bug-id="site083-bug02"
res.json({ data: {
  avgSleep: avgDuration,      // 실제 반환 키
  // averageHours: avgDuration  // ← 클라이언트 기대 키 (주석처리됨)
}});
```

### PPO 탐지 기대
- 응답 JSON 스키마에 `averageHours` 대신 `avgSleep`이 있으면 network-schema-mismatch 플래그
- API 문서 기대 필드 vs 실제 응답 필드 불일치 감지

---

## bug03
| 항목 | 내용 |
|------|------|
| **bugId** | site083-bug03 |
| **CSV 오류명** | 개인 수면 기록 접근 제어 실패 |
| **type** | security-idor |
| **발생 위치** | `server.js` — `GET /api/sleep-records/:id` |
| **data-bug-id** | `[data-bug-id="site083-bug03"]` |

### 증상
- `GET /api/sleep-records/6` → `user_anna` 수면 기록 노출 (현재 사용자: user_james)
- `GET /api/sleep-records/7` → `user_bob` 수면 기록 노출
- 히스토리 탭 IDOR 패널에서 재현 가능

### 원인
```javascript
// data-bug-id="site083-bug03"
app.get('/api/sleep-records/:id', (req, res) => {
  // record.userId !== CURRENT_USER 검증 완전 누락
  // 정상: if (record.userId !== CURRENT_USER) return res.status(403)...
  res.json({ success: true, data: record });
});
```

### PPO 탐지 기대
- `recordId` 6, 7 조회 시 `userId`가 현재 사용자와 다른데 200 반환되면 security-idor 플래그
