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
    likedBy: [],
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
    likedBy: [],
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
    likedBy: [],
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
 * @desc    Duvara yazılmış son 30 notu getirir (isOwner ve hasLiked bayraklarıyla)
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
        const hasLiked = Boolean(userToken && post.likedBy && post.likedBy.includes(userToken));
        const { authorToken, likedBy, ...rest } = post;
        return { ...rest, isOwner, hasLiked };
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
      const hasLiked = Boolean(userToken && post.likedBy && post.likedBy.includes(userToken));
      const { authorToken, likedBy, ...rest } = post;
      return { ...rest, isOwner, hasLiked };
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

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        error: 'BadRequest',
        status: 400,
        message: 'Not içeriği boş bırakılamaz.'
      });
    }

    const trimmedContent = content.trim();

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
        likedBy: [],
        posX: finalPosX,
        posY: finalPosY,
        rotation: computedRotation,
        authorToken
      });

      const responseData = newPost.toJSON();
      responseData.isOwner = true;
      responseData.hasLiked = false;

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
      likedBy: [],
      posX: finalPosX,
      posY: finalPosY,
      rotation: computedRotation,
      authorToken,
      createdAt: new Date().toISOString()
    };
    memoryPosts.unshift(newMemoryPost);

    const { authorToken: _, likedBy: __, ...clientPost } = newMemoryPost;
    clientPost.isOwner = true;
    clientPost.hasLiked = false;

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
 * @desc    Seçilen nota 1 beğeni ekler (Her kullanıcı 1 kez beğenebilir)
 * @access  Public
 * @status  200 OK | 400 Bad Request (Zaten beğenilmişse) | 404 Not Found | 429 Too Many Requests
 */
router.post('/:id/like', likeRateLimiter, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userToken = req.headers['x-author-token'] || req.ip;

    if (!userToken) {
      return res.status(400).json({
        error: 'BadRequest',
        status: 400,
        message: 'Beğeni yapabilmek için kullanıcı kimliği belirlenemedi.'
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

      const existingPost = await Post.findById(id);
      if (!existingPost) {
        return res.status(404).json({
          error: 'NotFound',
          status: 404,
          message: 'Not bulunamadı.'
        });
      }

      // KONTROL: Kullanıcı bu kartı daha önce beğendi mi?
      if (existingPost.likedBy && existingPost.likedBy.includes(userToken)) {
        return res.status(400).json({
          error: 'AlreadyLiked',
          status: 400,
          message: 'Bu notu zaten beğendiniz! Her karta yalnızca 1 kez beğeni bırakabilirsiniz.'
        });
      }

      // 1 Beğeni artır ve listeye ekle
      const updatedPost = await Post.findByIdAndUpdate(
        id,
        {
          $inc: { likes: 1 },
          $addToSet: { likedBy: userToken }
        },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        status: 200,
        message: 'Beğenildi! ❤️',
        likes: updatedPost.likes,
        hasLiked: true
      });
    }

    // DB bağlı değilse bellek içi kontrol
    const found = memoryPosts.find((p) => p.id === id);
    if (!found) {
      return res.status(404).json({
        error: 'NotFound',
        status: 404,
        message: 'Not bulunamadı.'
      });
    }

    if (!found.likedBy) found.likedBy = [];

    // KONTROL: Kullanıcı bu kartı daha önce beğendi mi?
    if (found.likedBy.includes(userToken)) {
      return res.status(400).json({
        error: 'AlreadyLiked',
        status: 400,
        message: 'Bu notu zaten beğendiniz! Her karta yalnızca 1 kez beğeni bırakabilirsiniz.'
      });
    }

    found.likedBy.push(userToken);
    found.likes = (found.likes || 0) + 1;

    return res.status(200).json({
      success: true,
      status: 200,
      message: 'Beğenildi! ❤️',
      likes: found.likes,
      hasLiked: true
    });
  } catch (error) {
    next(error);
  }
});

export default router;
