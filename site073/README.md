# North Ledger

- 사이트 이름: North Ledger
- 사이트 ID: `site073`
- 포트 번호: `9292`
- 기술 스택: Vanilla HTML, CSS, JavaScript, Express
- 주제: 개인 투자 포트폴리오 대시보드 mock 웹사이트

## 실행 방법

```bash
cd site073
npm install
npm start
```

브라우저에서 `http://localhost:9292`로 접속합니다.

## API 엔드포인트

- `GET /api/health`: 서버 상태와 사이트 식별 정보를 반환합니다.
- `GET /api/holdings`: 자산 ID, 이름, 유형, 수량, 평가금액, 수익률, 비중 데이터를 반환합니다.
- `GET /api/transactions`: 거래 ID, 날짜, 자산명, 유형, 금액, 상태 데이터를 반환합니다.

## 정상 작동 기능

- 자산 유형 필터
- 보유 종목 검색
- 필터 초기화
- 거래 내역 월 필터
- 관심 종목 추가 토글
- 관심 종목 제거 토글
- 관심 종목 패널 제거 버튼
- 자산 상세 모달 열기
- 자산 상세 모달 닫기
- ESC 키로 모달 닫기
- 포트폴리오 요약 패널 접기/펼치기
- 리스크 안내 확인 체크박스
- API 로딩 상태 UI
- API 에러 상태 UI
- 준비 중 기능의 `alert('준비중입니다.')` 처리

## 의도된 프론트엔드 오류 3개

- `site073-bug01`: 포트폴리오 합계 불일치
- `site073-bug02`: 테이블 컬럼 overflow
- `site073-bug03`: 리포트 다운로드 버튼 무반응

세부 오류 정의와 PPO 에이전트 기대 행동은 `BUGS.md`를 참고하세요. 구현 및 확인 항목은 `TODO.md`에 정리되어 있습니다.
