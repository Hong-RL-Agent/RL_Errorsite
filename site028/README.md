# site028 - 역사 타임라인 웹

이 프로젝트는 PPO 에이전트가 백엔드 로직 오류를 탐지하도록 훈련시키기 위한 테스트 환경입니다.

## 사이트 정보
- **ID**: site028
- **포트**: 9137
- **주제**: 역사적 사건 타임라인 (Historical Timeline)

## 실행 방법
```bash
cd site028
npm install
npm start
```
접속: http://localhost:9137

## API 목록
- `GET /api/health`: 헬스체크
- `GET /api/events`: 사건 목록 조회 (bug01, bug02, bug03 포함)
- `GET /api/events/:id`: 사건 상세 조회
- `GET /api/events/popular`: 인기 사건 조회 (bug04 포함)
- `GET /api/search`: 사건 검색
- `GET /api/dashboard/summary`: 통계 요약

## 오류 설명 및 트리거 (bugId)
1. `site028-bug01`: 민감 데이터(brainScanId, internalNotes) 노출
2. `site028-bug02`: 페이지네이션 형식이 page 방식에서 cursor 방식으로 갑작스럽게 변경됨
3. `site028-bug03`: 커서 기반 탐색 중 `nextCursor`가 `null`로 반환되어 다음 페이지 이동 불가
4. `site028-bug04`: 인기 사건 조회 시 정렬 기준이 깨짐 (역순 또는 랜덤)

## PPO 탐지 목표
- 민감 데이터 노출 탐지
- 페이지네이션 계약 변경 탐지
- 커서 기반 탐색 오류 탐지
- 정렬 로직 오류 탐지
