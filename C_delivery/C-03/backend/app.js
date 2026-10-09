const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const usersRouter = require('./routes/users');
const testRouter = require('./routes/test');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'C-03 AdminDesk User Management API' });
});

app.use('/api/users', usersRouter);
app.use('/api/test', testRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'API route not found' });
});

// Global error
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
