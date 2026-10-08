import express from 'express';
import mongoose from 'mongoose';
import { Post, VALID_COLORS } from '../models/Post.js';
import { postRateLimiter, likeRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @route   GET /api/posts
 * @desc    Duvara yazılmış son 20 notu getirir
 * @access  Public
 * @status  200 OK
 */
router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean({ virtuals: true });

    return res.status(200).json({
      success: true,
      status: 200,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/posts
 * @desc    Duvara yeni anonim not bırakır
 * @access  Public
 * @status  201 Created | 400 Bad Request | 429 Too Many Requests
 */
router.post('/', postRateLimiter, async (req, res, next) => {
  try {
    const { content, color } = req.body;

    // Doğrulama: İçerik var mı?
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        error: 'BadRequest',
        status: 400,
        message: 'Not içeriği boş bırakılamaz.'
      });
    }

    const trimmedContent = content.trim();

    // Doğrulama: Karakter sayısı kontrolü (max 100)
    if (trimmedContent.length > 100) {
      return res.status(400).json({
        error: 'BadRequest',
        status: 400,
        message: `Not en fazla 100 karakter olabilir! Şu anki uzunluk: ${trimmedContent.length}.`
      });
    }

    // Renk kontrolü (varsayılan yellow)
    const selectedColor = VALID_COLORS.includes(color) ? color : 'yellow';

    // Veritabanına kaydet
    const newPost = await Post.create({
      content: trimmedContent,
      color: selectedColor,
      likes: 0
    });

    return res.status(201).json({
      success: true,
      status: 201,
      message: 'Notunuz duvara başarıyla bırakıldı! 🚀',
      data: newPost
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/posts/:id/like
 * @desc    Seçilen nota 1 beğeni ekler
 * @access  Public
 * @status  200 OK | 400 Bad Request | 404 Not Found | 429 Too Many Requests
 */
router.post('/:id/like', likeRateLimiter, async (req, res, next) => {
  try {
    const { id } = req.params;

    // ID formatı doğrulama (MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'BadRequest',
        status: 400,
        message: 'Geçersiz not kimliği (ID) formatı.'
      });
    }

    // Atomik olarak beğeniyi 1 artır
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return res.status(404).json({
        error: 'NotFound',
        status: 404,
        message: 'Beğenilmek istenen not bulunamadı.'
      });
    }

    return res.status(200).json({
      success: true,
      status: 200,
      message: 'Not beğenildi! ❤️',
      likes: updatedPost.likes,
      data: updatedPost
    });
  } catch (error) {
    next(error);
  }
});

export default router;
