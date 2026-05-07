# SkyDash - Weather Dashboard (site002)

## 개요
- **사이트 이름**: SkyDash
- **사이트 ID**: site002
- **포트 번호**: 9111
- **기술 스택**: React + Vite + Express
- **주제**: 날씨 정보 대시보드

이 웹사이트는 PPO(Proximal Policy Optimization) 에이전트가 백엔드 API 로직 오류 및 데이터 처리 오류를 탐지하도록 훈련시키기 위한 독립 테스트 환경입니다.

## 실행 방법
```bash
cd site002
npm install
npm run build
npm start
```
이후 브라우저에서 `http://localhost:9111` 로 접속합니다.

## API 엔드포인트 목록
- `GET /api/health` - 항상 `{ ok: true, status: "healthy" }` 반환
- `GET /api/weather/current?city=seoul` - 지정된 도시의 현재 날씨 반환
- `GET /api/weather/forecast?city=seoul&days=7` - 지정된 도시의 주간 예보 반환
- `GET /api/weather/detail?city=seoul` - 특정 도시의 상세 날씨 지표 반환
- `GET /api/weather/regions?region=all` - 타 지역 날씨 리스트 반환

## 정상 작동 기능
- 좌측 사이드바에서 주요 도시(Seoul, Busan, Jeju) 클릭 시 메인 화면의 데이터가 즉시 갱신됨
- 상단 에러 배너의 닫기 버튼 클릭 시 에러 메시지 제거
- API 로딩 중에는 각 섹션에 'Loading...' 상태 표시

## 의도된 백엔드 오류 (3개)
각 백엔드 로직 오류는 좌측 하단의 빨간색 [PPO Test Triggers] 버튼들을 눌러 트리거할 수 있습니다. 각 오류는 서버 `server.js`에 주석 처리되어 있습니다.

1. **`site002-bug01` (null-reference)**
   - **트리거 방법**: 좌측 `Ghost City Detail (Bug 01)` 버튼 클릭
   - **연결된 data-bug-id**: `data-bug-id="site002-bug01"`
   - **설명**: `detail` 정보가 없는 도시에 대해 강제로 객체 필드를 참조하여 서버에서 500 오류가 발생합니다.

2. **`site002-bug02` (type-parsing)**
   - **트리거 방법**: 좌측 `Invalid Forecast Days (Bug 02)` 버튼 클릭
   - **연결된 data-bug-id**: `data-bug-id="site002-bug02"`
   - **설명**: 주간 예보의 `days` 값으로 `abc`라는 문자를 보내어 타입 파싱 에러(422)를 발생시킵니다.

3. **`site002-bug03` (api-timeout)**
   - **트리거 방법**: 좌측 `Slow Coast Filter (Bug 03)` 버튼 클릭
   - **연결된 data-bug-id**: `data-bug-id="site002-bug03"`
   - **설명**: 특정 지역 요청에 대해서만 서버가 의도적으로 6초의 응답 지연을 발생시키고 408 타임아웃을 반환합니다.

## PPO 에이전트 기대 행동
- 프론트엔드 DOM 요소의 `data-bug-id`를 인식하고 해당 인터랙션을 수행
- Network 로그 또는 화면에 렌더링된 에러 상태 메시지를 통해 오류(500, 422, 408)를 관찰
- 각 버그 아이디(`bugId`)와 백엔드의 주석에 적힌 오류 유형을 매칭하여 분류 모델을 최적화

## 배포 시 주의사항
- 본 서비스는 PPO 학습용 Mock 서비스로 DB나 외부 결제가 연결되어 있지 않습니다.
- 포트 9111이 시스템에서 점유 중인지 확인 후 실행해 주세요.
- Vite 빌드 결과물은 `dist` 폴더에 생성되어 Express가 정적으로 서빙합니다.
