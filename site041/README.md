# PawMate — Pet Care & Reservation Platform (site041)

PawMate는 반려동물 보호자가 주변의 펫시터, 1:1 산책 서비스, 미용실 및 돌봄 서비스를 검색하고 예약할 수 있는 반려동물 라이프케어 플랫폼입니다.

## 1. Project Information
* **Site ID:** `site041`
* **Service Name:** PawMate
* **Category:** Pet Care & Reservation Platform
* **Port:** `9940`
* **Tech Stack:** React 18 + Vite 5 + Express 4

## 2. Running the Application
```bash
npm install
npm run build
npm start
npm run dev
```

## 3. Health Check API
```http
GET http://localhost:9940/api/health
```
Response:
```json
{
  "status": "ok",
  "service": "PawMate",
  "port": 9940
}
```
