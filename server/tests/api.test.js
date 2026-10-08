import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';

describe('📡 Anonim Dijital Duvar API Entegrasyon Testleri', () => {

  after(async () => {
    try {
      await mongoose.disconnect();
    } catch (_) {}
  });

  test('1. [200 OK] Sağlık Kontrolü: GET /api/health', async () => {
    const res = await request(app).get('/api/health');

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.ok(res.body.timestamp);
  });

  test('2. [200 OK] Notları Listeleme: GET /api/posts', async () => {
    const res = await request(app).get('/api/posts');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });

  test('3. [400 Bad Request] Boş Not Gönderildiğinde Reddedilmeli: POST /api/posts', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ content: '   ', color: 'yellow' });

    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'BadRequest');
    assert.match(res.body.message, /boş bırakılamaz/i);
  });

  test('4. [400 Bad Request] 100 Karakter Sınırı Aşıldığında Reddedilmeli: POST /api/posts', async () => {
    const longText = 'A'.repeat(105);
    const res = await request(app)
      .post('/api/posts')
      .send({ content: longText, color: 'cyan' });

    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'BadRequest');
    assert.match(res.body.message, /en fazla 100 karakter/i);
  });

  let createdPostId;
  const authorToken = 'test-token-ci-12345';

  test('5. [201 Created] Geçerli Not Başarıyla Eklenmeli: POST /api/posts', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('x-author-token', authorToken)
      .send({
        content: 'CI/CD Otomatik Test Notu 🚀',
        color: 'pink',
        posX: 50,
        posY: 50
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
    assert.equal(res.body.data.content, 'CI/CD Otomatik Test Notu 🚀');
    assert.equal(res.body.data.isOwner, true);

    createdPostId = res.body.data.id;
  });

  test('6. [200 OK] Nota 1. Kez Beğeni Eklenebilmeli: POST /api/posts/:id/like', async () => {
    assert.ok(createdPostId, 'Önceki testte not oluşturulmuş olmalı');

    const res = await request(app)
      .post(`/api/posts/${createdPostId}/like`)
      .set('x-author-token', 'unique-liker-999');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.hasLiked, true);
    assert.equal(res.body.likes, 1);
  });

  test('7. [400 Bad Request] Aynı Kullanıcı 2. Kez Beğenmeye Çalışırsa Engellenmeli: POST /api/posts/:id/like', async () => {
    assert.ok(createdPostId);

    const res = await request(app)
      .post(`/api/posts/${createdPostId}/like`)
      .set('x-author-token', 'unique-liker-999');

    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'AlreadyLiked');
    assert.match(res.body.message, /zaten beğendiniz/i);
  });

  test('8. [403 Forbidden] Başkasının Notunu Silmeye Çalışan Reddedilmeli: DELETE /api/posts/:id', async () => {
    assert.ok(createdPostId);

    const res = await request(app)
      .delete(`/api/posts/${createdPostId}`)
      .set('x-author-token', 'malicious-hacker-token-000');

    assert.equal(res.status, 403);
    assert.equal(res.body.error, 'Forbidden');
    assert.match(res.body.message, /sadece oluşturan kişi silebilir/i);
  });

  test('9. [200 OK] Notu Oluşturan Yazar Başarıyla Silebilmeli: DELETE /api/posts/:id', async () => {
    assert.ok(createdPostId);

    const res = await request(app)
      .delete(`/api/posts/${createdPostId}`)
      .set('x-author-token', authorToken);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.match(res.body.message, /başarıyla silindi/i);
  });

  test('10. [404 Not Found] Olmayan Endpoint Çağrıldığında 404 Dönmeli', async () => {
    const res = await request(app).get('/api/olmayan-endpoint');

    assert.equal(res.status, 404);
    assert.equal(res.body.error, 'NotFound');
  });

});
