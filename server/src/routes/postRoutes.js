import express from 'express';
import mongoose from 'mongoose';
import { Post, VALID_COLORS } from '../models/Post.js';
import { postRateLimiter, likeRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const getRandomRotation = () => Number((Math.random() * 8 - 4).toFixed(1));

// Bellek içi yedek depo
let memoryPosts = [
  {
    id: 'mock-1',
    content: '🚀 Anonim Dijital Duvar hazır! İstediğin boş bir yere tıkla ve notunu bırak.',
    color: 'cyan',
    likes: 12,
    posX: 18,
    posY: 18,
    rotation: -2.5,
    authorToken: 'system-demo-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: 'mock-2',
    content: '🔥 Boş alana tıklayıp doğrudan oraya not yapıştırabilirsin!',
    color: 'purple',
    likes: 8,
    posX: 52,
    posY: 32,
    rotation: 2.1,
    authorToken: 'system-demo-2',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  },
  {
    id: 'mock-3',
    content: '☕ Gece kahvesi ve sessizlik.',
    color: 'yellow',
    likes: 24,
    posX: 30,
    posY: 60,
    rotation: -1.2,
    authorToken: 'system-demo-3',
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString()
  }
];

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * @route   GET /api/posts
 * @desc    Duvara yazılmış son 30 notu getirir (istek sahibine isOwner bayrağını işaretler)
 * @access  Public
 * @status  200 OK
 */
router.get('/', async (req, res, next) => {
  try {
    const userToken = req.headers['x-author-token'];

    if (isDbConnected()) {
      const posts = await Post.find()
        .sort({ createdAt: -1 })
        .limit(30)
        .lean({ virtuals: true });

      const sanitizedPosts = posts.map((post) => {
        const isOwner = Boolean(userToken && post.authorToken && post.authorToken === userToken);
        const { authorToken, ...rest } = post;
        return { ...rest, isOwner };
      });

      return res.status(200).json({
        success: true,
        status: 200,
        source: 'database',
        count: sanitizedPosts.length,
        data: sanitizedPosts
      });
    }

    // DB bağlı değilse bellek içi veriyi dön
    const sanitizedMemory = memoryPosts.map((post) => {
      const isOwner = Boolean(userToken && post.authorToken && post.authorToken === userToken);
      const { authorToken, ...rest } = post;
      return { ...rest, isOwner };
    });

    return res.status(200).json({
      success: true,
      status: 200,
      source: 'memory-fallback',
      count: sanitizedMemory.length,
      data: sanitizedMemory
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
    const { content, color, posX, posY, rotation } = req.body;
    const authorToken = req.headers['x-author-token'] || req.body.authorToken || `anon-${Date.now()}`;

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
        message: `Not en fazla 100 karakter olabilir! Şu anki: ${trimmedContent.length}.`
      });
    }

    const selectedColor = VALID_COLORS.includes(color) ? color : 'yellow';
    const computedRotation = typeof rotation === 'number' ? rotation : getRandomRotation();
    const finalPosX = typeof posX === 'number' ? posX : Math.floor(Math.random() * 70 + 10);
    const finalPosY = typeof posY === 'number' ? posY : Math.floor(Math.random() * 60 + 15);

    if (isDbConnected()) {
      const newPost = await Post.create({
        content: trimmedContent,
        color: selectedColor,
        likes: 0,
        posX: finalPosX,
        posY: finalPosY,
        rotation: computedRotation,
        authorToken
      });

      const responseData = newPost.toJSON();
      responseData.isOwner = true;

      return res.status(201).json({
        success: true,
        status: 201,
        message: 'Notunuz duvara yapıştırıldı! 📌',
        data: responseData
      });
    }

    const newMemoryPost = {
      id: `mem-${Date.now()}`,
      content: trimmedContent,
      color: selectedColor,
      likes: 0,
      posX: finalPosX,
      posY: finalPosY,
      rotation: computedRotation,
      authorToken,
      createdAt: new Date().toISOString()
    };
    memoryPosts.unshift(newMemoryPost);

    const { authorToken: _, ...clientPost } = newMemoryPost;
    clientPost.isOwner = true;

    return res.status(201).json({
      success: true,
      status: 201,
      message: 'Notunuz duvara yapıştırıldı! 📌',
      data: clientPost
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/posts/:id
 * @desc    Notu siler (YALNIZCA oluşturan kişi silebilir)
 * @access  Public (Author Token korumalı)
 * @status  200 OK | 400 Bad Request | 401 Unauthorized | 403 Forbidden | 404 Not Found
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userToken = req.headers['x-author-token'];

    if (!userToken) {
      return res.status(401).json({
        error: 'Unauthorized',
        status: 401,
        message: 'Bu işlemi yapabilmek için yazar tokeni gereklidir. (401 Unauthorized)'
      });
    }

    if (isDbConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          error: 'BadRequest',
          status: 400,
          message: 'Geçersiz not ID formatı.'
        });
      }

      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({
          error: 'NotFound',
          status: 404,
          message: 'Silinmek istenen not bulunamadı.'
        });
      }

      // Sahiplik kontrolü
      if (!post.authorToken || post.authorToken !== userToken) {
        return res.status(403).json({
          error: 'Forbidden',
          status: 403,
          message: 'Bu notu sadece oluşturan kişi silebilir! (403 Forbidden)'
        });
      }

      await Post.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        status: 200,
        message: 'Notunuz başarıyla silindi. 🗑️'
      });
    }

    // DB bağlı değilse bellekten silme
    const postIndex = memoryPosts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      return res.status(404).json({
        error: 'NotFound',
        status: 404,
        message: 'Silinmek istenen not bulunamadı.'
      });
    }

    const memoryPost = memoryPosts[postIndex];
    if (!memoryPost.authorToken || memoryPost.authorToken !== userToken) {
      return res.status(403).json({
        error: 'Forbidden',
        status: 403,
        message: 'Bu notu sadece oluşturan kişi silebilir! (403 Forbidden)'
      });
    }

    memoryPosts.splice(postIndex, 1);

    return res.status(200).json({
      success: true,
      status: 200,
      message: 'Notunuz başarıyla silindi. 🗑️'
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

    if (isDbConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          error: 'BadRequest',
          status: 400,
          message: 'Geçersiz not ID formatı.'
        });
      }

      const updatedPost = await Post.findByIdAndUpdate(
        id,
        { $inc: { likes: 1 } },
        { new: true, runValidators: true }
      );

      if (!updatedPost) {
        return res.status(404).json({
          error: 'NotFound',
          status: 404,
          message: 'Not bulunamadı.'
        });
      }

      return res.status(200).json({
        success: true,
        status: 200,
        message: 'Beğenildi! ❤️',
        likes: updatedPost.likes,
        data: updatedPost
      });
    }

    const found = memoryPosts.find((p) => p.id === id);
    if (!found) {
      return res.status(404).json({
        error: 'NotFound',
        status: 404,
        message: 'Not bulunamadı.'
      });
    }

    found.likes = (found.likes || 0) + 1;

    return res.status(200).json({
      success: true,
      status: 200,
      message: 'Beğenildi! ❤️',
      likes: found.likes,
      data: found
    });
  } catch (error) {
    next(error);
  }
});

export default router;
