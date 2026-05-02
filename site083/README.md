# SleepCoach | site083 | port 9412

## 실행
```bash
cd site083 && npm install && npm start
# → http://localhost:9412
```

## API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/health` | 서버 상태 |
| GET | `/api/sleep-records` | 수면 기록 목록 (from, to, q 필터) |
| GET | `/api/sleep-records/:id` | 기록 상세 (⚠️ bug03) |
| POST | `/api/sleep-records` | 수면 기록 추가 |
| GET | `/api/stats` | 통계 (⚠️ bug02: avgSleep 반환) |
| GET | `/api/routines` | 루틴 목록 |
| POST | `/api/routines/save` | 루틴 저장 |
| GET | `/api/goals` | 목표 조회 |
| PUT | `/api/goals` | 목표 수정 |

## 정상 인터랙션 (14개)
1. 수면 기록 추가 폼 / 2. 날짜 범위 필터 / 3. 메모·태그 검색 / 4. 수면 기록 카드 클릭 → 모달 / 5. 루틴 저장 버튼 / 6. 통계 새로고침 / 7. 목표 시간 설정 / 8. 목표 취침·기상 시간 설정 / 9. 뷰 탭 전환 / 10. 알림 벨 클릭 / 11. 히스토리 테이블 조회 / 12. IDOR 패널 recordId 조회 / 13. 헤더 새로고침 / 14. 모달 닫기

## 의도된 오류 3개
| ID | Type | 설명 |
|----|------|------|
| bug01 | database-calculation | 자정 초과 수면 시간 음수 반환 (`calcSleepDuration_buggy`) |
| bug02 | network-schema-mismatch | `/api/stats` 가 `avgSleep` 반환 (기대: `averageHours`) |
| bug03 | security-idor | `/api/sleep-records/:id` 소유자 검증 없음 → id 6,7로 타 유저 기록 노출 |

## 참고
- BUGS.md — 오류 3개 상세 문서
- TODO.md — 구현 현황
