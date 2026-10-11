const express = require('express');
const cors = require('cors');
const db = require('./db/connection');
const { createSchema } = require('./db/init');
const { seedAll } = require('./db/seed');
const { HttpError } = require('./services/errors');

const PORT = 9717;

createSchema(db);
if (db.prepare('SELECT COUNT(*) AS c FROM hospitals').get().c === 0) {
  seedAll(db);
  console.log('[server] initial seed data created');
}

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', require('./routes/misc'));
app.use('/api', require('./routes/catalog'));
app.use('/api/appointments', require('./routes/appointments'));

app.use('/api', (req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: '존재하지 않는 API입니다.' } });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ error: { code: 'INVALID_JSON', message: '요청 본문 형식이 올바르지 않습니다.' } });
  }
  console.error(err);
  return res.status(500).json({ error: { code: 'INTERNAL', message: '서버 내부 오류가 발생했습니다.' } });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[MediSlot B-03] backend listening on http://localhost:${PORT}`);
});
