# TableNote
Personal Recipe & Meal Planning Platform

TableNote는 나만의 소중한 요리 레시피를 손쉽게 기록하고, 주간 식단을 직관적으로 계획하며, 다른 홈쿡러들의 창의적인 요리 노하우를 함께 나눌 수 있는 개인 요리 및 식단 관리 전문 웹 플랫폼입니다.

## Tech Stack
- Frontend: React 18, Vite
- Styling: Vanilla CSS (Custom Design System with Olive Green, Sage, Cream & Warm Beige Palette)
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
- Response: `{"status": "ok", "service": "tablenote"}`
- Port: `9949`
