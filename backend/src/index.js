require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const transactionRoutes = require('./routes/transactions');
const analyticsRoutes = require('./routes/analytics');
const alertRoutes = require('./routes/alerts');
const queryRoutes = require('./routes/query');
const healthRoutes = require('./routes/health');

// Import services
const { startPolling } = require('./services/chainPoller');
const { startHealthChecker } = require('./services/healthChecker');
const AlertEngine = require('./services/alertEngine');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Alert engine
const alertEngine = new AlertEngine();
app.set('alertEngine', alertEngine);

// Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/health', healthRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'InitScan API',
    version: '1.0.0',
    description: 'Cross-Rollup Intelligence Platform for Initia',
    endpoints: [
      'GET  /api/transactions',
      'GET  /api/transactions/:hash',
      'POST /api/query',
      'GET  /api/analytics/summary',
      'GET  /api/analytics/chain/:id',
      'GET  /api/health/rollups',
      'GET  /api/alerts',
      'POST /api/alerts',
      'PATCH /api/alerts/:id',
      'DELETE /api/alerts/:id',
    ],
  });
});

// Socket.io connections
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join all_chains room by default
  socket.join('all_chains');

  // Allow clients to join specific chain rooms
  socket.on('join_chain', (chainId) => {
    socket.join(chainId);
    console.log(`📡 ${socket.id} joined ${chainId}`);
  });

  socket.on('leave_chain', (chainId) => {
    socket.leave(chainId);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Connect to MongoDB and start services
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/initscan';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    // Start the server
    server.listen(PORT, () => {
      console.log(`🚀 InitScan API running on port ${PORT}`);

      // Start chain polling
      startPolling(io, alertEngine);

      // Start health checker
      startHealthChecker(io);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = { app, server, io };
