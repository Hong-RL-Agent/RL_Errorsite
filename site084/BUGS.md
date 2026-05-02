# BUGS.md — site084 PlantClinic

## bug01
| 항목 | 내용 |
|------|------|
| **bugId** | site084-bug01 |
| **CSV 오류명** | DB 진단 매핑 오류 |
| **type** | database-relation |
| **발생 위치** | `server.js` — `POST /api/diagnosis` |
| **data-bug-id** | `[data-bug-id="site084-bug01"]` |

### 증상
- 어떤 증상(symptomId)을 선택해도 항상 "질소 결핍" 진단 결과 반환
- symptomId=7(벌레)을 선택해도 disease: "질소 결핍" 응답

### 원인
```javascript
// data-bug-id="site084-bug01"
const diagnosis = diagnosisMap[1]; // 항상 id:1 기준
// 정상: const diagnosis = diagnosisMap[parseInt(symptomId)];
```

### PPO 탐지 기대
- 서로 다른 symptomId로 요청해도 동일한 disease 반환 시 database-relation 플래그
- `symptomId`와 반환된 병해 데이터의 불일치 감지

---

## bug02
| 항목 | 내용 |
|------|------|
| **bugId** | site084-bug02 |
| **CSV 오류명** | 네트워크 실패 응답 불명확 |
| **type** | network-error-handling |
| **발생 위치** | `server.js` — `POST /api/diagnosis` (symptomId 없을 때) |
| **data-bug-id** | `[data-bug-id="site084-bug02"]` |

### 증상
- symptomId 없이 POST 요청 시 `{}` 빈 객체로 400 응답
- 클라이언트가 오류 원인(코드, 메시지) 파악 불가

### 원인
```javascript
// data-bug-id="site084-bug02"
return res.status(400).json({}); // 빈 객체
// 정상: res.status(400).json({ success: false, message: '...', code: 'MISSING_SYMPTOM_ID' })
```

### PPO 탐지 기대
- 400 응답 body가 `{}` (빈 객체)이면 network-error-handling 플래그
- 응답에 `success`, `message`, `code` 필드가 없는 경우 탐지

---

## bug03
| 항목 | 내용 |
|------|------|
| **bugId** | site084-bug03 |
| **CSV 오류명** | 상담 기록 소유자 검증 누락 |
| **type** | security-authorization |
| **발생 위치** | `server.js` — `GET /api/consultations/:id` |
| **data-bug-id** | `[data-bug-id="site084-bug03"]` |

### 증상
- `GET /api/consultations/3` → `user_bloom`의 난초 상담 기록 노출
- `GET /api/consultations/4` → `user_leaf`의 고무나무 상담 기록 노출
- 상담 기록 탭의 IDOR 패널에서 id 3, 4 입력으로 재현

### 원인
```javascript
// data-bug-id="site084-bug03"
// consult.userId !== CURRENT_USER 검증 없음
// 정상: if (consult.userId !== CURRENT_USER) return res.status(403)...
res.json({ success: true, data: consult });
```

### PPO 탐지 기대
- `/api/consultations/3` 응답의 `userId`가 `user_green`이 아닌데 200 반환 시 security-authorization 플래그
