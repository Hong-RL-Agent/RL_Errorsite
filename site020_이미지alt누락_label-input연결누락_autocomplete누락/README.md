# site020: 호텔 예약 플랫폼

## 정보
- 사이트 이름: StayPremium
- 사이트 ID: site020
- 포트 번호: 9239
- 기술 스택: React, Vite, Express, Vanilla CSS

## 실행 방법
1. `cd site020`
2. `npm install`
3. `npm run build`
4. `npm start`
5. http://localhost:9239 접속

## API 엔드포인트
- `GET /api/health`: 서버 상태 확인
- `GET /api/hotels`: 호텔 목록 조회 (검색어, 별점, 가격 필터 지원)
- `GET /api/rooms`: 선택 호텔의 객실 옵션 데이터
- `POST /api/booking`: 예약 확정 모의 동작

## 정상 기능 목록
- 지역 이름, 호텔 이름으로 검색 정상 동작
- 좌측 사이드바 필터(호텔 등급, 가격 슬라이더) 정상 동작
- 호텔 카드 클릭 시 객실 정보 모달 및 상세 내역 모달 열기/닫기 정상
- 인원 선택 드롭다운(성인, 아동) 메뉴 토글 및 닫기 정상
- 데이터 Fetch 간의 Loading 스피너 렌더링
- 미구현된 상단 버튼 등은 "준비중입니다." 알럿 표시

## 의도된 프론트엔드 오류 3개
1. **[site020-bug01] 대체 텍스트 누락 (missing-image-alt)**: 추천 호텔 카드의 썸네일 이미지에 `alt` 속성이 없어 스크린 리더에서 정보 획득 불가.
2. **[site020-bug02] 레이블과 입력창 연결 누락 (label-input-disconnect)**: 체크인 날짜 라벨(`htmlFor`)과 인풋(`id`)이 불일치하여, 라벨 클릭 시 인풋 포커스 이동 실패.
3. **[site020-bug03] 자동완성 미지원 (autocomplete-missing)**: 예약 폼(이름, 이메일, 전화번호)에서 `autocomplete` 속성을 누락하여 사용자가 매번 번거롭게 직접 입력해야 하는 불편 초래.

## PPO 에이전트 탐지 기대 행동
에이전트는 3가지 폼/웹 접근성 위반 사항(alt 누락, label 불일치, autocomplete 누락)을 정확하게 탐지해야 합니다. 검색 필터 변경 등 정상적인 인터랙션에 따른 리렌더링이나 API 로딩 상태를 오류로 간주하지 않도록 주의가 필요합니다.

자세한 버그 명세는 [BUGS.md](./BUGS.md)를, 진행 사항은 [TODO.md](./TODO.md)를 참고해 주십시오.
