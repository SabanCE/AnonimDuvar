import rateLimit from 'express-rate-limit';

// Not ekleme spam koruyucusu (15 dakikada en fazla 10 not)
export const postRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 10, // IP başına maksimum 10 istek
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'TooManyRequests',
      status: 429,
      message: 'Sakin ol şampiyon! Çok hızlı istek gönderiyorsun. Lütfen spam yapma ve biraz bekle. (429 Too Many Requests)'
    });
  }
});

// Beğeni spam koruyucusu (1 dakikada en fazla 30 beğeni)
export const likeRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'TooManyRequests',
      status: 429,
      message: 'Çok hızlı beğeni gönderiyorsunuz! Lütfen biraz bekleyin. (429 Too Many Requests)'
    });
  }
});
