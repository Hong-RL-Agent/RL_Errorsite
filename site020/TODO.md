# TODO - site020 (Smart Logistics)

## 리뉴얼 진행
- [x] 프로젝트 테마 변경 (Logistics)
- [x] server.js 물류 데이터 및 API 리팩토링
- [x] App.jsx 물류 관제 UI 리팩토링
- [x] 스타일 가이드 유지 및 아이콘 업데이트
- [x] 의도된 오류 4개 컨텍스트 재설정
- [x] README.md 및 BUGS.md 업데이트

## 검증 진행
- [x] npm install 확인
- [x] npm run build 확인 (dist 폴더 정리 후 성공)
- [x] npm start 확인
- [x] 브라우저 접속 확인 (http://localhost:9129)
- [x] /api/health 확인
- [x] 리뉴얼된 4개 버그 작동 확인
- [x] 모든 메뉴(통계, 설정 등) 및 필터 버튼 작동 확인

## 의도된 오류 목록 (Logistics Context)
- [x] site020-bug01 - 배차 복구 시 비동기 주문 데이터 유실
- [x] site020-bug02 - 부패한 배송 상태 복원 무한 루프
- [x] site020-bug03 - 배송 재시도 핸들러 내 자원 누수
- [x] site020-bug04 - 차량 배차 락 고아 현상
