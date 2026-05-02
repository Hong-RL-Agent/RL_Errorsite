# Neighborhood Trade (site088)

Local community bartering service for PPO training.

## Information
- Port: 9417
- Tech: Node.js (Express), Vanilla JS, CSS
- Focus: Item trading, Offer management, Security (IDOR)

## Features
- **Explore**: Browse items neighbors are trading and see what they want in return.
- **My Offers**: Track the status of your trade proposals.
- **Reviews**: Community feedback system.
- **Safety**: Safe trading guidelines.

## APIs
- `GET /api/health`: Health check.
- `GET /api/items`: List tradable items.
- `GET /api/my-offers`: Get offers related to the current user (vulnerable to state logic error).
- `GET /api/offers/:id`: Get detail of a specific offer (vulnerable to IDOR).
- `POST /api/offers`: Create a new trade offer (vulnerable to validation error).
- `GET /api/reviews`: List trade reviews.

## How to run
1. `npm install`
2. `npm start`
3. Open `http://localhost:9417`
