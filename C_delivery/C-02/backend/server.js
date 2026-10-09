const app = require('./app');
const store = require('./data/store');

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await store.init();
    console.log('SQLite database initialized at backend/data/flowdesk.db');

    app.listen(PORT, () => {
      console.log(`Flowdesk backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Flowdesk server:', error);
    process.exit(1);
  }
}

startServer();
