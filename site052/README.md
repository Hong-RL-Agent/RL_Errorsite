# SpaceMate (site052)

> 공유 오피스 및 스터디룸 예약·관리 SaaS 플랫폼

SpaceMate는 직장인, 프리랜서, 스타트업 및 학생들을 위해 전국 주요 거점의 1인 집중석, 스터디룸, 회의실, 오픈 데스크를 실시간으로 탐색하고 간편하게 예약할 수 있는 올인원 워크스페이스 관리 플랫폼입니다.

---

## Tech Stack

* **Frontend**: React 18, Vite, Vanilla CSS (Deep Navy & Modern SaaS Aesthetic)
* **Backend**: Node.js, Express
* **Database**: In-Memory Mock Database
* **Port**: `9951`

---

## Key Features

* **공간 탐색 및 필터링**: 10개 주요 지점, 30개 이상의 공간을 유형별/인원별/시설별로 실시간 검색
* **시간대별 스마트 예약**: 날짜별 실시간 예약 가능 슬롯 확인 및 원클릭 예약 신청
* **내 예약 관리**: 예약 예정, 이용 중, 이용 완료, 취소 상태 관리 및 개인 메모 수정
* **내 워크스페이스**: 즐겨찾는 공간, 최근 방문 공간, 저장된 검색 조건 관리
* **CSV 내보내기**: 예약 내역 전체 다운로드 지원
* **공지사항**: 지점별 주요 운영 소식 및 시설 개선 공지 제공

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Build & Start Server
```bash
npm start
```

### 3. Service URL
브라우저에서 다음 주소로 접속합니다:
* 서비스 홈: `http://localhost:9951`
* Health Check: `http://localhost:9951/api/health`

---

## Health Check API

```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "SpaceMate",
  "site": "site052"
}
```
