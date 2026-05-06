# Atelier Veyron Gallery

- 사이트 이름: Atelier Veyron Gallery
- 사이트 ID: site043
- 포트 번호: 9262
- 기술 스택: React, Vite, Express, lucide-react

## 실행 방법

```bash
cd site043
npm install
npm run build
npm start
```

브라우저에서 `http://localhost:9262`로 접속합니다.

## API 엔드포인트

- `GET /api/health`: 서버 상태 확인
- `GET /api/artworks`: 작품 ID, 작품명, 작가 ID, 제작 연도, 재료, 카테고리, 이미지, 문의 가능 여부 반환
- `GET /api/artists`: 작가 ID, 이름, 소개, 대표작, 프로필 이미지, 전시 이력 반환

## 정상 작동 기능

- 작품 데이터 API fetch 및 로딩 UI 표시
- 작가 데이터 API fetch 및 로딩 UI 표시
- 작품 카테고리 필터
- 작가 필터
- 작품명/재료 검색
- 필터 초기화
- 작품 상세 모달 열기/닫기
- 전시 일정 탭 전환
- 컬렉션 문의 sticky 패널 입력
- 컬렉션 문의 drawer 열기/닫기
- 정상 작품 카드의 구매 문의 drawer 열기
- 뉴스레터 알림 체크박스
- 구현 대상 외 메뉴와 제출 버튼은 `준비중입니다.` alert 표시

## 의도된 프론트엔드 오류 3개

1. `site043-bug01` - 작가 정보 빈 렌더링: 특정 작품 상세 모달의 작가 정보가 artistId 타입 불일치로 비어 보임
2. `site043-bug02` - 이미지 캡션 겹침: 특정 작품 카드 캡션이 absolute 배치 오류로 이미지와 주변 영역을 침범함
3. `site043-bug03` - 구매 문의 버튼 무반응: 특정 작품의 구매 문의 버튼만 drawer를 열지 않음

자세한 오류 명세는 `BUGS.md`, 진행 상태는 `TODO.md`를 참고합니다.
