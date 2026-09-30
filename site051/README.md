# TripLog
Travel Journal & Itinerary Sharing Platform

TripLog는 나만의 소중한 여행 경험과 날짜별 세부 일정을 기록하고, 다른 여행자들과 생생한 여행 꿀팁 및 후기를 공유할 수 있는 감성 여행 전문 플랫폼입니다.

## Tech Stack
- Frontend: React 18, Vite
- Styling: Vanilla CSS (Custom Design System with Ocean Blue, Sky Blue, Sand Beige & Coral Palette)
- Backend: Express (In-Memory Mock Database)
- Build: esbuild

## Run

```bash
npm install
npm start
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Health Check
- `GET /api/health`
- Response: `{"status": "ok", "service": "triplog"}`
- Port: `9950`
