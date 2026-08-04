# Atelier Noir Studio

- 사이트 ID: site037
- 포트 번호: 9256
- 기술 스택: React + Vite + Express
- 주제: 사진 스튜디오 포트폴리오 웹사이트

## 실행 방법

```bash
cd site037
npm install
npm run build
npm start
```

브라우저에서 `http://localhost:9256`으로 접속합니다.

## API 엔드포인트

- `GET /api/health`: 사이트 상태 확인
- `GET /api/photos`: 사진 ID, 제목, 카테고리, 이미지 URL, 촬영 장소, 연도, 좋아요 수 반환
- `GET /api/services`: 서비스명, 가격, 설명, 촬영 시간과 납품 범위 반환

## 정상 작동 기능

- 상단 포트폴리오, 서비스, 후기, 문의 메뉴 앵커 이동
- 상단 예약 문의 버튼의 문의 폼 이동
- 갤러리 카테고리 필터 상태 변경
- API 로딩 스켈레톤 UI
- API 에러 상태와 다시 불러오기 버튼 UI
- 이미지 클릭 시 프로젝트 상세 lightbox 열기
- lightbox 닫기, 이전/다음 이미지 이동
- 사진 좋아요 버튼 토글과 표시 수 반영
- 서비스 가격표 탭 전환
- 문의 폼 입력값과 오른쪽 프리뷰 실시간 반영
- 문의 폼 제출 알림
- 준비되지 않은 SNS, 룩북, 세부 견적 기능의 `준비중입니다.` 알림

## 의도된 프론트엔드 오류 3개

- `site037-bug01`: 갤러리 필터 상태 불일치
- `site037-bug02`: lightbox z-index 오류
- `site037-bug03`: 문의 버튼 무반응

자세한 오류 재현 정보는 `BUGS.md`를 확인하세요. 구현 및 검증 체크리스트는 `TODO.md`에 정리되어 있습니다.
