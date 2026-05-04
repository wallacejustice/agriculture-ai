require('dotenv').config(); // ✅ MUST BE FIRST LINE - loads .env before any JWT operations

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();

// Middleware - CORS Configuration (FIXED FOR ALL ORIGINS)
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [ 
      'http://localhost:3000',
      'http://localhost:5000',
      
      // ✅ CRITICAL: NO TRAILING SPACES AFTER .app
      'https://agripal-app.vercel.app',
      
      ...(process.env.FRONTEND_URL 
        ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
        : ['https://agripal-app.vercel.app'])
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ Allowed CORS Origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ Blocked CORS Origin: ${origin}`);
      console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

console.log(`📡 Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'defaults to Vercel'}`);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/conversations', require('./routes/conversationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/user', require('./routes/notificationRoutes'));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI for Agriculture API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to AI for Agriculture API',
    version: '1.0.0',
    documentation: 'Visit /health for health check'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Global error:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`✅ CORS configured for: localhost + Vercel + Render`);
});