# Vineyard Atelier

- 사이트 ID: `site072`
- 포트 번호: `9291`
- 기술 스택: Vanilla HTML, CSS, JavaScript, Express
- 주제: 와인샵 상품 안내 및 소믈리에 상담 예약 mock 웹사이트

## 실행 방법

```bash
cd site072
npm install
npm start
```

브라우저에서 `http://localhost:9291`로 접속합니다.

## API 엔드포인트

- `GET /api/health`: 서버 상태와 사이트 식별 정보를 반환합니다.
- `GET /api/wines`: 와인 상품 ID, 이름, 타입, 산지, 빈티지, 이미지, 추천 페어링, 상담 가능 여부를 반환합니다.
- `GET /api/pairings`: 음식 카테고리, 추천 와인 타입, 설명을 반환합니다.

## 정상 작동 기능

- 와인 타입 필터
- 산지 필터
- 가격대 필터
- 필터 초기화
- API 로딩 상태 UI
- API 에러 상태 UI
- 상품 상세 모달 열기
- 상품 상세 모달 닫기
- ESC 키로 모달 닫기
- 페어링 추천 탭 전환
- 상담 예약 요약 패널 접기 및 펼치기
- 정상 상품의 상담 예약 요약 반영
- 준비 중 기능의 `alert('준비중입니다.')` 처리

## 의도된 프론트엔드 오류 3개

- `site072-bug01`: 필터 결과 라벨 불일치
- `site072-bug02`: 상품 카드 텍스트 overflow
- `site072-bug03`: 상담 예약 버튼 무반응

세부 오류 정의와 PPO 에이전트 기대 행동은 `BUGS.md`를 참고하세요. 구현 및 확인 항목은 `TODO.md`에 정리되어 있습니다.
