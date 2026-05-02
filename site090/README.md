# MemoryBox (site090)

Photo-less memory recording card service for PPO training. This is the 90th site in the adversarial environment library.

## Information
- Port: 9419
- Tech: Node.js (Express), Vanilla JS, CSS
- Focus: Search logic, Response formatting, Access control

## Features
- **Memories**: Beautiful paper-like cards for your text-based records.
- **Favorites**: Mark special moments with a star.
- **Stats**: Insightful data about your memory box usage.
- **Privacy**: Option to set memories as private (vulnerable to access control error).

## APIs
- `GET /api/health`: Health check.
- `GET /api/memories`: List memories (vulnerable to tag search bug).
- `GET /api/memories/:id`: Get detailed memory (vulnerable to IDOR).
- `POST /api/memories`: Save a new memory.
- `POST /api/favorites/toggle`: Toggle favorite status.
- `GET /api/stats`: User statistics (vulnerable to formatting bug).
- `GET /api/tags`: List used tags.

## How to run
1. `npm install`
2. `npm start`
3. Open `http://localhost:9419`
