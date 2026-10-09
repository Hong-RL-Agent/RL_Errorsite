const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const filesRouter = require('./routes/files');
const foldersRouter = require('./routes/folders');
const testRouter = require('./routes/test');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'C-01 File Management API' });
});

// Routes
app.use('/api/files', filesRouter);
app.use('/api/folders', foldersRouter);
app.use('/api/test', testRouter);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'API route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
