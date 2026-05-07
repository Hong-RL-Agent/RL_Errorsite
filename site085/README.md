# site085 - CSV 가계부 분석 서비스

이 프로젝트는 PPO(Proximal Policy Optimization) 강화학습 에이전트가 CSV 데이터 파싱, 필드 매핑, 데이터 타입 변환 및 중복 레코드 처리 로직에서 발생하는 백엔드 오류를 탐지하도록 설계된 테스트베드입니다.

## 프로젝트 정보
- **ID**: site085
- **포트**: 9194
- **기술 스택**: React + Vite + Express + Recharts
- **주제**: CSV 업로드 기반 스마트 가계부 및 지출 분석 서비스

## 실행 방법
```bash
cd site085
npm install
npm run build
npm start
```
접속: http://localhost:9194

## 정상 기능
- CSV 데이터 시뮬레이션 및 업로드
- 지출 내역 상세 조회 (Transactions)
- 카테고리별 지출 분포 분석 (Statistics)
- 월별 지출 트렌드 분석 (Statistics)
- 데이터 처리 오딧 로그 모니터링 (Audit Logs)

## 의도된 백엔드 오류 (PPO 탐지 목표)

### 1. CSV 구분자 파싱 오류 (csv-delimiter-misparse)
- **ID**: `site085-bug01`
- **API**: `POST /api/upload`
- **트리거**: **Upload** 탭에서 **'CSV 파일 스마트 분석'** 버튼 클릭
- **현상**: 세미콜론(;) 구분자가 포함된 CSV 데이터 처리 시 필드를 구분하지 못하고 단일 컬럼으로 인식하여 데이터가 깨짐

### 2. 필드 매핑 밀림 (field-mapping-shift)
- **ID**: `site085-bug02`
- **API**: `GET /api/stats/category`
- **트리거**: **Statistics** 탭에서 **'카테고리 매핑 최적화'** 버튼 클릭
- **현상**: 카테고리 통계 산출 시 '카테고리' 필드가 아닌 '설명' 필드를 키로 사용하고 금액 대신 ID 값을 매핑하는 로직 오류

### 3. 타입 변환 실패 (type-conversion-failure)
- **ID**: `site085-bug03`
- **API**: `GET /api/stats/monthly`
- **트리거**: **Statistics** 탭에서 **'월별 지출 정밀 분석'** 버튼 클릭
- **현상**: 숫자형 데이터 변환 과정에서 문자열 포함 시 NaN을 발생시켜 월별 총액 계산이 무너짐

### 4. 중복 레코드 이중 집계 (duplicate-record-double-count)
- **ID**: `site085-bug04`
- **API**: `GET /api/stats`
- **트리거**: **Upload** 탭에서 **'지출 총계 정합성 검증'** 버튼 클릭
- **현상**: 총액 합산 시 특정 레코드를 중복으로 더하여 실제 금액보다 높은 총계가 산출됨

## PPO 학습 목표
- 파일 파싱 및 데이터 정규화 로직 검증
- 필드 매핑 및 스키마 정합성 판단
- 수치 데이터 타입 변환 무결성 확인
- 데이터 중복 집계 방지 로직 검증
