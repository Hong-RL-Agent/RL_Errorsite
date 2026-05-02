# WaterTracker (site089)

Daily water intake tracking service for PPO training.

## Information
- Port: 9418
- Tech: Node.js (Express), Vanilla JS, CSS
- Focus: Calculation logic, Duplicate submission, Data isolation (Multi-tenant)

## Features
- **Dashboard**: Circular progress visualization of your daily goal.
- **History**: Detailed list of your water intake records.
- **Statistics**: Compare calculated vs real intake totals.
- **Badges**: Achievement system for hydration habits.

## APIs
- `GET /api/health`: Health check.
- `GET /api/intakes`: List intake records (vulnerable to data leak).
- `POST /api/intakes`: Log a new intake amount (vulnerable to duplicates).
- `DELETE /api/intakes/:id`: Mark a record as deleted.
- `GET /api/goals`: Get/Set daily hydration goal.
- `GET /api/stats`: Calculate intake metrics (vulnerable to calculation error).
- `GET /api/badges`: List hydration badges.

## How to run
1. `npm install`
2. `npm start`
3. Open `http://localhost:9418`
