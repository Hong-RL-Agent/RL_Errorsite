# FreshCart — Grocery & Same-Day Delivery Platform (site046)

FreshCart는 식료품과 생활용품을 검색하고 장바구니에 담은 뒤 새벽/당일 배송 시간대를 선택하여 주문하는 온라인 장보기 플랫폼입니다.

## 1. Project Information
* **Site ID:** `site046`
* **Service Name:** FreshCart
* **Port:** `9945`
* **Tech Stack:** React 18 + Vite 5 + Express 4
* **Theme:** Grocery & Same-Day Delivery Platform

## 2. Running the Application
```bash
# Install dependencies
npm install

# Build frontend production bundle
npm run build

# Start backend server & serve frontend
npm start

# Development mode
npm run dev
```

## 3. Health Check API
```http
GET http://localhost:9945/api/health
```
Response:
```json
{
  "status": "ok",
  "service": "FreshCart",
  "port": 9945
}
```

## 4. Key Features
* 🛒 **상품 검색 및 카테고리 필터링** (신선식품, 과일/채소, 정육, 유제품, 라면, 생활용품)
* 🏷️ **실시간 할인 및 품절 임박 재고 표시**
* 🧺 **장바구니 & 무료배송 프로그레스 바** (40,000원 이상 무료배송)
* 🎫 **쿠폰 적용 시스템** (신규가입 5,000원 쿠폰 등)
* 📍 **배송지 관리 및 배송 가능 권역 검증**
* ⏰ **새벽 07:00 / 당일 오후 / 저녁 배송 시간대 선택**
* 💳 **적립금(포인트) 사용 및 주문 결제**
* 📦 **주문 내역, 부분 환불 / 반품 신청, 주문 취소, 재주문**
* ❤️ **찜하기 및 고객 신선 후기/별점 작성**
