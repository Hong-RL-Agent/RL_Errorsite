const app = require('./app');
const store = require('./data/store');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await store.init();
    console.log('SQLite database initialized at backend/data/cloudfiles.db');

    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
