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

// Trust proxy for rate limiting (especially useful on Render, Vercel, Heroku, etc.)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST'],
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

startServer();

export default app;
