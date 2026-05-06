# Ivory Page Bookclub

- 사이트 이름: Ivory Page Bookclub
- 사이트 ID: `site067`
- 포트 번호: `9286`
- 기술 스택: Vanilla HTML, CSS, JavaScript, Express
- 주제: 독서 모임 / 북클럽 커뮤니티 웹사이트

## 실행 방법

```bash
cd site067
npm install
npm start
```

브라우저에서 `http://localhost:9286`에 접속합니다.

개발 실행:

```bash
npm run dev
```

빌드 검증:

```bash
npm run build
```

## API 엔드포인트

- `GET /api/health`: 서비스 상태 확인
- `GET /api/clubs`: 모임 ID, 모임명, 장르, 선정 도서, 일정, 장소, 정원, 참여 인원 반환
- `GET /api/members`: 멤버 ID, 이름, 관심 장르, 참여 모임 수, 프로필 이미지 반환

## 정상 작동 기능

- `/api/clubs` 데이터를 fetch로 받아 독서 모임 카드 grid 렌더링
- `/api/members` 데이터를 fetch로 받아 멤버 리스트 렌더링
- 장르 필터
- 모임 검색
- 모임 상세 모달 열기/닫기
- 일정 캘린더 날짜 선택과 해당 날짜 모임 표시
- 토론 주제 accordion
- 참여 예정 패널 접기/펼치기
- API 로딩 상태와 에러 상태 UI
- 아직 구현하지 않은 메뉴와 참여 신청서 제출은 `준비중입니다.` alert 표시

## 의도된 프론트엔드 오류 3개

1. `site067-bug01`: 멤버 리스트 중복 렌더링
   - 상세 모달의 참여 멤버 목록에서 특정 멤버가 한 번 더 append되어 중복 표시됩니다.
2. `site067-bug02`: 카드 정렬 깨짐
   - 긴 선정 도서 제목을 가진 카드만 line-clamp와 버튼 하단 정렬이 빠져 카드 높이와 버튼 위치가 어긋납니다.
3. `site067-bug03`: 참가 버튼 무반응
   - 특정 모임 카드의 참가 버튼은 활성처럼 보이지만 click listener가 없어 참여 예정 패널에 추가되지 않습니다.

자세한 오류 위치와 PPO 탐지 기대 행동은 `BUGS.md`를 확인하세요. 생성 및 검증 체크리스트는 `TODO.md`에 기록되어 있습니다.
