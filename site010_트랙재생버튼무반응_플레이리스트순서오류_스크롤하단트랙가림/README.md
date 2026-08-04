# SoundWave - 음악 스트리밍 서비스

## 사이트 정보

| 항목 | 내용 |
|------|------|
| **사이트 이름** | SoundWave |
| **사이트 ID** | site010 |
| **포트** | 9229 |
| **기술 스택** | React 18 + Vite 5 + Express 4 + Lucide React |
| **주제** | 다크 네온그린 테마 음원 스트리밍 사이트 |

## 실행 방법

```bash
cd site010
npm install
npm run build   # React 앱 빌드
npm start       # Express 서버 실행 (포트 9229)
```

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/playlists` | 사이드바 플레이리스트 데이터 제공 |
| GET | `/api/tracks` | 본문 트랙 목록 (Top 50 등) 제공 |

## 정상 작동 기능

- ✅ 트랙 목록 Hover 시 시각적 반응 및 하트(Like) 버튼 토글 가능
- ✅ 재생 버튼 클릭 시 하단 플레이어의 Now Playing 정보 동기화
- ✅ 하단 플레이어에서 Play/Pause 상태 토글 및 가상의 진행률 바(Progress Bar) 애니메이션 동작
- ✅ 반응형 앱 레이아웃 (본문 영역 독립적 스크롤링)

## 의도된 GUI 오류 3개

### site010-bug01 — button-no-response
- **위치**: 트랙 목록 중 2번째 곡의 재생(Play) 버튼
- **증상**: 다른 곡들과 달리 해당 곡의 재생 버튼을 누르면 하단 플레이어 상태가 갱신되지 않고 아무 동작도 하지 않음.
- **selector**: `[data-bug-id="site010-bug01"]`

### site010-bug02 — component-rendering
- **위치**: 사이드바 하단 'PLAYLISTS' 섹션
- **증상**: API가 제공하는 플레이리스트의 순서와 다르게, 항목들의 순서가 강제로 뒤집혀(Reverse) 렌더링 됨.
- **selector**: `[data-bug-id="site010-bug02"]`

### site010-bug03 — css-layout
- **위치**: 메인 트랙 리스트 영역의 스크롤 하단
- **증상**: 본문을 끝까지 아래로 스크롤했을 때, 마지막 곡들이 하단 고정 플레이어 바(Player Bar) 뒤로 들어가 가려져 온전한 조작이 어려움.
- **selector**: `[data-bug-id="site010-bug03"]`
