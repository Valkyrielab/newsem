require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initializePool, closePool } = require('./db');

// Import route modules
const contractsRoutes = require('./routes/contracts');
const confirmationsRoutes = require('./routes/confirmations');
const warningsRoutes = require('./routes/warnings');
const disciplinaryRoutes = require('./routes/disciplinary');
const maternityRoutes = require('./routes/maternity');
const approvalsRoutes = require('./routes/approvals');

const app = express();
const PORT = process.env.PORT || 5000;

// ========================
// MIDDLEWARE
// ========================

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ========================
// ROUTES
// ========================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/contracts', contractsRoutes);
app.use('/api/confirmations', confirmationsRoutes);
app.use('/api/warnings', warningsRoutes);
app.use('/api/disciplinary', disciplinaryRoutes);
app.use('/api/maternity', maternityRoutes);
app.use('/api/approvals', approvalsRoutes);

// ========================
// ERROR HANDLING
// ========================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('✗ Unhandled error:', error);
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal Server Error'
  });
});

// ========================
// SERVER START
// ========================

async function startServer() {
  try {
    // Initialize database connection pool
    await initializePool();
    console.log('✓ Database pool initialized');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API endpoints available at http://localhost:${PORT}/api/*`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await closePool();
  process.exit(0);
});

// Start server
startServer();
