# NeighborHands
Local Volunteer Activity Management Platform

NeighborHands는 우리 동네의 다양한 봉사활동을 쉽고 편리하게 탐색하고, 참여를 신청하며, 이웃들과 따뜻한 나눔의 경험을 공유할 수 있는 지역 봉사활동 종합 관리 플랫폼입니다.

## Tech Stack
- Frontend: React 18, Vite
- Styling: Vanilla CSS (Custom Design System with Forest Green, Mint & Cream Palette)
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
- Response: `{"status": "ok", "service": "neighborhands"}`
- Port: `9948`
