# FitDash - 피트니스 대시보드

## 사이트 정보

| 항목 | 내용 |
|------|------|
| **사이트 이름** | FitDash |
| **사이트 ID** | site003 |
| **포트** | 9222 |
| **기술 스택** | React 18 + Vite 5 + Express 4 + Lucide React |
| **주제** | 피트니스 대시보드 (다크 모드) |

## 실행 방법

```bash
cd site003
npm install
npm run build   # React 앱 빌드
npm start       # Express 서버 실행 (포트 9222)
```

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/user` | 사용자 프로필 정보 조회 |
| GET | `/api/stats/weekly` | 주간 소모 칼로리 및 통계 조회 |
| GET | `/api/routines?category=전체` | 오늘의 운동 루틴 목록 조회 |

## 정상 작동 기능

- ✅ 루틴 리스트 필터링 (부위별 탭 기능)
- ✅ 루틴 개별 항목 체크박스 클릭 상태 토글
- ✅ 목표 진행률(Goal Progress) 아코디언 메뉴 펼치기/접기
- ✅ 왼쪽 사이드바 메뉴 탭 전환 UI 변경 기능

## 의도된 GUI 오류 3개

### site003-bug01 — button-no-response
- **위치**: 대시보드 상단 "운동 추가" 버튼
- **증상**: 버튼을 클릭해도 어떠한 모달이나 이동 동작이 일어나지 않음
- **selector**: `[data-bug-id="site003-bug01"]`

### site003-bug02 — component-rendering
- **위치**: "주간 칼로리 소모량" 카드
- **증상**: 데이터가 존재함에도 무조건 '데이터 없음' UI를 보여줌
- **selector**: `[data-bug-id="site003-bug02"]`

### site003-bug03 — css-layout
- **위치**: "주간 칼로리 소모량" 차트 렌더링 영역 (bug02 코드에서 숨겨져 있지만 개발자 도구로 노출 시 발생)
- **증상**: 차트 요소 너비가 부모 너비를 초과하여 레이아웃이 우측으로 터짐
- **selector**: `[data-bug-id="site003-bug03"]`

## 배포 및 테스트 주의사항

- PPO 에이전트는 API에서 내려온 데이터 유무와 화면 렌더링 상태의 모순을 감지해야 함.
- 포트는 `9222`로 고정됨.
