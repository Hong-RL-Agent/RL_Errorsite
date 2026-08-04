# Site045 - Luxe Bloom Beauty Salon

## 사이트 정보
- 사이트 이름: Luxe Bloom Beauty Salon
- 사이트 ID: site045
- 포트: 9264
- 기술 스택: React + Vite + Express

## 실행 방법
1. `cd site045`
2. `npm install`
3. `npm run build`
4. `npm start`
5. 브라우저에서 `http://localhost:9264` 접속

## API 엔드포인트
- `GET /api/health` - 서버 상태 확인
- `GET /api/services` - 시술 목록 데이터
- `GET /api/stylists` - 스타일리스트 목록 데이터

## 정상 작동 기능
- 시술 카테고리 필터링
- 스타일리스트 선택 표시
- 날짜 및 시간 선택
- 시술 상세 모달 열기/닫기
- 멤버십 혜택 아코디언 동작
- API 로딩 상태 및 에러 상태 UI
- 예약 요약 패널에 선택된 시술, 예약 시간, 가격 표시
- 프리미엄 스타일링 예약 CTA
- 데스크톱 기반 고급 뷰티 브랜드 레이아웃
- 푸터 내 정책 및 고객센터 링크

## 의도된 프론트엔드 오류
1. `site045-bug01` - 예약 요약 상태 불일치
2. `site045-bug02` - 하단바 겹침
3. `site045-bug03` - 스타일리스트 선택 버튼 무반응

## 문서
- `BUGS.md` - 의도된 오류 상세 설명
- `TODO.md` - 생성 및 검증 상태
