# 영어 단어 암기장 - 비동기 처리 및 데이터 일관성 오류 탐지 환경 (Site035)

이 사이트는 영어 단어 암기 관리 앱으로 위장한 **비동기 처리 및 데이터 일관성 결함 탐지 학습 환경**입니다. 
PPO 강화학습 에이전트는 응답 순서의 무작위성, 트랜잭션 원자성 위반(부분 성공/실패), 웹훅 계약 변경 및 스키마 불일치, 그리고 데이터 직렬화 과정에서의 필드 누락을 식별해야 합니다.

## 🛠 기술 스택
- **Frontend**: React + Vite + Lucide React + Framer Motion
- **Backend**: Express (Node.js)
- **Port**: 9144 (Frontend) / 9150 (Backend)

## 🚀 실행 방법
```bash
cd site035
npm install
npm start
```

## 📡 API 엔드포인트
- `GET /api/health`: 서비스 상태 확인
- `GET /api/words`: 단어 목록 조회 (Bug 01 트리거)
- `POST /api/words`: 단어 추가 (Bug 02 트리거)
- `GET /api/words/:id`: 단어 상세 조회 (Bug 05 트리거)
- `POST /api/webhook/send`: 매뉴얼 웹훅 전송 (Bug 03 트리거)
- `GET /api/webhook/logs`: 웹훅 이벤트 로그 조회 (Bug 04 트리거)

## ❗ 의도된 백엔드 오류 (Async & Consistency Errors)

### 1. [site035-bug01] response-order-change (응답 순서 변경)
- **설명**: 단어 목록 조회 시 추가된 순서가 아닌 무작위(Random) 순서로 데이터가 반환됩니다.
- **트리거**: "Words" 탭에서 "목록 새로고침" 클릭

### 2. [site035-bug02] atomicity-violation (원자성 깨짐)
- **설명**: 단어 추가 시 데이터베이스 저장은 성공하지만, 연동된 웹훅 전송은 실패하는 부분 성공 현상이 발생합니다.
- **트리거**: "단어 추가" 모달에서 저장 시도

### 3. [site035-bug03] webhook-payload-change (웹훅 페일로드 변경)
- **설명**: 웹훅 전송 시 `word` 필드명이 예고 없이 `term`으로 변경되어 전달됩니다.
- **트리거**: 단어 카드의 웹훅 아이콘 클릭

### 4. [site035-bug04] webhook-schema-mismatch (웹훅 스키마 불일치)
- **설명**: 웹훅 로그 응답에 정의되지 않은 내부 디버깅 필드(`internalTraceId` 등)가 포함되어 스키마 계약을 위반합니다.
- **트리거**: "Webhook Logs" 탭 진입

### 5. [site035-bug05] serialization-error (직렬화/역직렬화 오류)
- **설명**: 단어 상세 조회 시 서버 내부 직렬화 오류로 인해 `definition` 필드가 누락되고 `word`가 강제로 대문자로 변환됩니다.
- **트리거**: 단어 카드 클릭 (상세 보기)

## 🤖 PPO 학습 목표
- 비동기 데이터의 일관된 정렬 보장 여부 검증
- 분산 처리 시스템에서의 원자성(All-or-Nothing) 위반 탐지
- 외부 시스템 연동 계약(Webhook Contract) 변경 감지
- 데이터 변환 레이어(Serialization)에서의 무결성 검증
