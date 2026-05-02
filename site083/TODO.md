# TODO.md — site083 SleepCoach

## 완료
- [x] package.json (port 9412)
- [x] server.js — 3개 의도된 오류
- [x] public/index.html — 5개 뷰 + 모달
- [x] public/css/style.css — 다크 네이비/인디고 테마
- [x] public/js/app.js — 14개 인터랙션
- [x] README.md / BUGS.md / TODO.md
- [x] bug01: database-calculation — 자정 초과 수면 시간 음수
- [x] bug02: network-schema-mismatch — avgSleep vs averageHours
- [x] bug03: security-idor — /api/sleep-records/:id 소유자 검증 없음

## 미완료
- [ ] 자정 초과 수면 계산 정상화 (bug01 픽스)
- [ ] 통계 API 필드명 통일 (bug02 픽스)
- [ ] 수면 기록 소유자 검증 (bug03 픽스)
- [ ] 수면 분석 AI 추천
- [ ] 알람 기능 (Web Notifications API)
- [ ] 수면 차트 (Chart.js)
