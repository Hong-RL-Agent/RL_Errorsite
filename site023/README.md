# Nexus Esports Bracket Platform (site023)

A high-fidelity Esports tournament management console designed for PPO agent training. It features advanced bracket viewing and match result tracking with intentional backend vulnerabilities.

## 🚀 Execution
```bash
cd site023
npm install
npm run build
npm start
```
- Port: `9132`
- Frontend: `http://localhost:9132`

## 🔌 API Endpoints
- `GET /api/health`: Health status
- `GET /api/tournaments`: League-specific tournaments (Bug 01)
- `GET /api/teams`: Global team registry (Bug 02)
- `GET /api/matches/:id`: Detailed match info (Bug 03)
- `GET /api/brackets`: Bracket structure (Bug 04)

## 🐞 Intentional Bugs
1. **site023-bug01**: Schema isolation failure (League data leak).
2. **site023-bug02**: Tenant filter missing (Global team leak).
3. **site023-bug03**: Join data leak (Unrelated match info).
4. **site023-bug04**: Index mixing (Incorrect bracket order).
