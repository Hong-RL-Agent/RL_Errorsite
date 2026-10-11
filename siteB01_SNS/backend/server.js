const express = require('express');
const cors = require('cors');
const { initSchema, db } = require('./db/database');
const { seedDatabase } = require('./db/seed');
const routes = require('./routes');
const { sendImage } = require('./controllers/imageController');

const PORT = 9715;

initSchema();
if (db.prepare('SELECT COUNT(*) AS n FROM users').get().n === 0) {
  seedDatabase(db);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/img/:name', sendImage);
app.use('/api', routes);

app.use('/api', (req, res) => {
  res.status(404).json({ error: '존재하지 않는 API입니다.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? '서버 오류가 발생했습니다.' : err.message });
});

app.listen(PORT, () => {
  console.log(`[Mingle backend] http://localhost:${PORT}`);
});
