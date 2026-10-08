import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Anonim Dijital Duvar API çalışıyor.',
    timestamp: new Date().toISOString()
  });
});

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
    message: 'Sunucuda beklenmeyen bir hata oluştu.'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Anonim Duvar API http://localhost:${PORT} üzerinde çalışıyor`);
});

export default app;
