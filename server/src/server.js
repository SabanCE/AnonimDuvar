import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import postRoutes from './routes/postRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Trust proxy for rate limiting (especially on Render, Railway, Vercel, Heroku)
app.set('trust proxy', 1);

// Flexible CORS setup for production (Vercel) & development (localhost)
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Allow defined origins or any vercel.app deployment preview
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // Default allow for public anonymous API
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-author-token'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'ok',
    database: dbStatus,
    message: 'Anonim Dijital Duvar API çalışıyor.',
    timestamp: new Date().toISOString()
  });
});

// Root welcome endpoint for Render status
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Anonim Dijital Duvar API - Render Deployment Active 🚀',
    health: '/api/health',
    posts: '/api/posts'
  });
});

// API Routes
app.use('/api/posts', postRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'NotFound',
    message: 'İstenen endpoint bulunamadı.'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Sunucu Hatası:', err);
  res.status(500).json({
    error: 'InternalServerError',
    message: err.message || 'Sunucuda beklenmeyen bir hata oluştu.'
  });
});

// Start server and connect DB
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Anonim Duvar API http://localhost:${PORT} üzerinde çalışıyor`);
  });
};

// Only listen when not running in test mode
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
