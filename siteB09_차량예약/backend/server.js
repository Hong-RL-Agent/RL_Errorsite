const express = require('express');
const cors = require('cors');
const { getDb, createSchema } = require('./db/init');
const { seedAll } = require('./db/seed');
const routes = require('./routes');

const PORT = 9723;

function bootstrap() {
  const db = getDb();
  createSchema(db);
  if (db.prepare('SELECT COUNT(*) AS n FROM vehicles').get().n === 0) seedAll(db);
}

bootstrap();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routes);

app.use('/api', (req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: '존재하지 않는 API 입니다.' } });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || (err instanceof SyntaxError ? 400 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({ error: { code: err.code || (status === 400 ? 'BAD_REQUEST' : 'INTERNAL_ERROR'), message: status >= 500 ? '서버 오류가 발생했습니다.' : err.message } });
});

app.listen(PORT, () => {
  console.log(`RoamDrive backend listening on http://localhost:${PORT}`);
});
