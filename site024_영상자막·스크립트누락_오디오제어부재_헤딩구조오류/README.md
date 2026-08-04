# BlueLogistics - 실시간 배송 추적 서비스

## 정보
- 사이트 ID: site024
- 포트 번호: 9243
- 기술 스택: React, Vite, Express, Lucide-React

## 실행 방법
1. `cd site024`
2. `npm install`
3. `npm run build`
4. `npm start`
5. http://localhost:9243 접속

## API 엔드포인트
- `GET /api/health`: 서버 상태 확인
- `GET /api/tracking?invoice=1234567890`: 송장번호별 배송 정보 조회
- `GET /api/recent-trackings`: 최근 조회 내역 목록

## 정상 기능 목록
- 송장번호 입력 및 배송 상태 조회 (예: 1234567890)
- 배송 단계별 타임라인 표시 및 상세 설명 토글
- 현재 배송 위치 지도 Mock 데이터 표시
- 최근 조회한 송장 클릭 시 즉시 재조회
- 알림 설정 패널 활성화 및 설정 UI

## 의도된 프론트엔드 오류 3개
1. **[site024-bug01] 자막 및 스크립트 누락**: 배송 안내 영상에 자막/대본 부재. (`src/components/TrackingHero.jsx`)
2. **[site024-bug02] 오디오 제어 기능 부재**: 알림음 미리보기 시 중지/볼륨 조절 불가. (`src/components/NotificationPanel.jsx`)
3. **[site024-bug03] 논리적이지 않은 헤딩 구조**: 헤딩 위계가 h1 -> h4 -> h2로 섞임. (`src/components/DeliveryTimeline.jsx`)

## PPO 에이전트 기대 행동
에이전트는 미디어 콘텐츠의 대체 텍스트 존재 여부, 오디오 콘텐츠에 대한 사용자 제어 가능성, 그리고 문서의 시맨틱한 위계 구조(Heading hierarchy)를 검증해야 합니다. 시각적으로는 정상이더라도 접근성 트리나 태그 구조에서 발생하는 결함을 탐지하는 것이 목표입니다.
