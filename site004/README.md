# EduLMS - 온라인 강의 플랫폼

## 사이트 정보

| 항목 | 내용 |
|------|------|
| **사이트 이름** | EduLMS |
| **사이트 ID** | site004 |
| **포트** | 9223 |
| **기술 스택** | React 18 + Vite 5 + Express 4 + Lucide React |
| **주제** | 온라인 강의 플랫폼 (LMS) |

## 실행 방법

```bash
cd site004
npm install
npm run build   # React 앱 빌드
npm start       # Express 서버 실행 (포트 9223)
```

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/categories` | 강의 카테고리 목록 조회 |
| GET | `/api/courses?category=전체&search=&filter=all` | 강의 목록 조회 (카테고리, 검색어, 상태 필터) |
| GET | `/api/announcements` | 공지사항 목록 조회 |

## 정상 작동 기능

- ✅ 카테고리 탭 클릭 시 해당 카테고리 강의만 필터링
- ✅ 검색창을 통한 강의명/강사명 검색 기능
- ✅ 상태 셀렉트를 통한 진행 중 / 수강 완료 필터링
- ✅ 수강 중인 강의에 대한 진행률(Progress Bar) 표시

## 의도된 GUI 오류 3개

### site004-bug01 — button-no-response
- **위치**: 미수강 강의 카드의 "수강신청" 버튼
- **증상**: 버튼 클릭해도 아무 이벤트 발생 안함
- **selector**: `[data-bug-id="site004-bug01"]`

### site004-bug02 — component-rendering
- **위치**: 강의 목록
- **증상**: API 응답에는 포함된 `id: 103` 강의 카드가 클라이언트에서 렌더링되지 않음
- **selector**: `[data-bug-id="site004-bug02"]` (안 보이기 때문에 실제 돔에서는 `display: none`인 빈 태그로 존재)

### site004-bug03 — css-layout
- **위치**: 우측 사이드바
- **증상**: `position: absolute` 설정으로 인해 사이드바가 메인 본문(강의 목록) 우측을 일부 덮어 가림
- **selector**: `[data-bug-id="site004-bug03"]`
