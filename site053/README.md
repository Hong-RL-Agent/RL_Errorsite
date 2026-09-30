# NearBuy (site053)

> 동네 이웃과 함께하는 따뜻하고 신뢰할 수 있는 지역 기반 온라인 중고거래 플랫폼

NearBuy는 디지털기기, 생활가전, 가구, 패션 등 사용하지 않는 물건을 이웃과 손쉽게 거래하고, 실시간 채팅으로 소통할 수 있는 C2C 중고마켓 서비스입니다.

---

## Tech Stack

* **Frontend**: React 18, Vite, Vanilla CSS (Warm Orange & Friendly Marketplace Theme)
* **Backend**: Node.js, Express
* **Database**: In-Memory Mock Database
* **Port**: `9952`

---

## Key Features

* **동네 상품 탐색 및 필터링**: 디지털기기, 생활가전, 가구 등 9개 카테고리별 실시간 검색
* **상품 상세 및 판매자 매너온도**: 상품 사진 갤러리, 상태, 거래 방식 및 판매자 프로필 확인
* **상품 등록 및 미리보기**: 다중 사진 등록, 가격 포맷팅, 판매글 미리보기 지원
* **실시간 1:1 거래 채팅**: 상품별 실시간 대화 및 약속 잡기
* **내 NearBuy**: 판매중/판매완료 내역, 찜한 상품, 매너점수 관리
* **신고하기**: 안전한 거래를 위한 간편 신고 기능

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
* 서비스 접속: `http://localhost:9952`
* Health Check: `http://localhost:9952/api/health`

---

## Health Check API

```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "NearBuy",
  "site": "site053"
}
```
