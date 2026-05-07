# 도시철도 통합 관제 시스템 - API 계약 및 스키마 오류 탐지 환경 (Site034)

이 사이트는 지하철 노선 및 지연 공지 대시보드로 위장한 **API 계약 위반 및 스키마 정합성 결함 탐지 학습 환경**입니다. 
PPO 강화학습 에이전트는 백엔드 응답에서 필수 필드 누락, 정의되지 않은 필드 추가, 데이터 타입 불일치, 그리고 열거형(Enum) 값의 유효성 위반을 식별해야 합니다.

## 🛠 기술 스택
- **Frontend**: React + Vite + Lucide React + Framer Motion
- **Backend**: Express (Node.js)
- **Port**: 9143 (Frontend) / 9148 (Backend)

## 🚀 실행 방법
```bash
cd site034
npm install
npm start
```

## 📡 API 엔드포인트
- `GET /api/health`: 서비스 상태 확인
- `GET /api/lines`: 노선 목록 조회 (Bug 02 트리거)
- `GET /api/stations`: 역 목록 조회 (Bug 03 트리거)
- `GET /api/alerts`: 지연 공지 목록 조회 (Bug 01 트리거)
- `GET /api/alerts/:id`: 지연 공지 상세 조회 (Bug 04 트리거)
- `GET /api/dashboard/summary`: 대시보드 요약 정보

## ❗ 의도된 백엔드 오류 (Schema & Contract Errors)

### 1. [site034-bug01] missing-required-field (필수 필드 누락)
- **설명**: 지연 공지 목록 응답에서 일부 레코드의 `lineId` 또는 `status` 필드가 누락되어 전달됩니다.
- **트리거**: "Alerts" 탭 진입 (공지 조회)

### 2. [site034-bug02] unexpected-extra-field (예상치 못한 필드 추가)
- **설명**: 노선 목록 응답의 최상위 레벨에 계약에 정의되지 않은 `debugMeta` 필드가 포함되어 있습니다.
- **트리거**: "Lines" 탭 진입 (노선 조회)

### 3. [site034-bug03] field-type-mismatch (필드 타입 불일치)
- **설명**: 역 목록 응답에서 `congestionLevel` 필드가 숫자(Number)여야 하나, 일부 레코드에서 문자열(String, "high")로 반환됩니다.
- **트리거**: "Stations" 탭 진입 (역 목록 조회)

### 4. [site034-bug04] enum-value-mismatch (열거값 불일치)
- **설명**: 상세 공지 응답의 `status` 필드 값이 정의된 세트(NORMAL, DELAY, SUSPENDED)가 아닌 "LATE" 또는 "STOP"으로 반환됩니다.
- **트리거**: "Alerts" 탭에서 특정 공지 카드 클릭 (공지 상세 보기)

## 🤖 PPO 학습 목표
- API 응답 스키마와 실제 데이터 간의 불일치(Contract Violation) 탐지
- 런타임 타입 체크를 통한 데이터 정합성 검증
- 열거형 데이터의 도메인 유효성(Domain Validation) 확인
- 필수 데이터 누락이 UI 렌더링에 미치는 영향 분석
