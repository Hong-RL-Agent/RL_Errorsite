# PlantClinic | site084 | port 9413

## 실행
```bash
cd site084 && npm install && npm start
# → http://localhost:9413
```

## API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/health` | 서버 상태 |
| GET | `/api/symptoms` | 증상 목록 (category 필터) |
| POST | `/api/diagnosis` | 진단 요청 (⚠️ bug01, bug02) |
| GET | `/api/plants` | 식물 목록 (type 필터) |
| GET | `/api/plants/:id` | 식물 상세 |
| GET | `/api/tips` | 관리 팁 (category 필터) |
| GET | `/api/consultations` | 내 상담 목록 |
| GET | `/api/consultations/:id` | 상담 상세 (⚠️ bug03) |
| POST | `/api/consultations` | 상담 신청 |

## 정상 인터랙션 (13개)
1. 증상 선택 (8개 증상 버튼) / 2. 식물 선택 드롭다운 / 3. 진단 시작 버튼 / 4. 진단 결과 상세 확인 / 5. 전문가 상담 신청 버튼 / 6. 상담 폼 제출 / 7. 식물 목록 타입 필터 / 8. 식물 카드 → 모달 / 9. 관리 팁 카테고리 필터 / 10. 상담 기록 탭 조회 / 11. IDOR 패널 consultationId 조회 / 12. 헤더 새로고침 / 13. 탭 전환

## 의도된 오류 3개
| ID | Type | 설명 |
|----|------|------|
| bug01 | database-relation | `POST /api/diagnosis` 항상 diagnosisMap[1](질소결핍) 반환 |
| bug02 | network-error-handling | symptomId 없을 때 `{}` 빈 객체로 400 응답 |
| bug03 | security-authorization | `GET /api/consultations/:id` 소유자 검증 없음 → id 3,4 IDOR |
