const app = require('./app');
const store = require('./data/store');

const PORT = process.env.PORT || 5002;

async function startServer() {
  try {
    await store.init();
    console.log('SQLite database initialized at backend/data/admindesk.db');

    app.listen(PORT, () => {
      console.log(`AdminDesk backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start AdminDesk server:', error);
    process.exit(1);
  }
}

startServer();
