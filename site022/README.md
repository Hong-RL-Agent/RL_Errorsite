# Vital Med Hospital Appointment System (site022)

This is a professional Hospital Appointment Management System designed for PPO agent training. It simulates a full-stack medical service with intentional backend logic flaws.

## 🚀 Execution
```bash
cd site022
npm install
npm run build
npm start
```
- Port: `9131`
- Frontend: `http://localhost:9131`

## 🔌 API Endpoints
- `GET /api/health`: Health status
- `GET /api/hospitals`: List of hospitals
- `GET /api/doctors`: List of doctors
- `GET /api/appointments`: Paginated appointments (Bugs 01, 02)
- `GET /api/appointments/:id`: Appointment details (Bug 03)
- `POST /api/appointments`: Book appointment (Bug 04)
- `GET /api/schedule`: Available slots

## 🐞 Intentional Bugs
1. **site022-bug01**: Pagination format change (Page -> Cursor) on Page 1.
2. **site022-bug02**: Invalid cursor error on specific pagination request.
3. **site022-bug03**: ISO date string changes to UNIX timestamp in details.
4. **site022-bug04**: Numeric overflow in new appointment ID generation.
