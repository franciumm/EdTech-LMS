import { Buffer } from 'node:buffer';
global.SlowBuffer = Buffer;
import { setupTestDB, teardownTestDB } from './setup.js';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../api/index.js';
import mongoose from 'mongoose';

describe('API Security Testing - Auth & Rate Limiting', () => {
  before(async () => {
    await setupTestDB();
  });

  after(async () => {
    await teardownTestDB();
  });
    
  describe('Rate Limiting on /api/v1/student/forget', () => {
    it('should block requests after 5 attempts', async () => {
      // Simulate 5 attempts (allowed)
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/student/forget')
          .send({ email: 'test@example.com' });
      }

      // 6th attempt should be blocked
      const res = await request(app)
        .post('/api/v1/student/forget')
        .send({ email: 'test@example.com' });

      assert.equal(res.status, 429);
      assert.match(res.text, /Too many email requests/);
    });
  });

  describe('NoSQL Injection Prevention on Login', () => {
    it('should strip unknown query parameters to prevent query injection', async () => {
      const res = await request(app)
        .post('/api/v1/student/login?email[$ne]=null&password[$ne]=null')
        .send({ email: 'valid@example.com', password: 'password123' });

      assert.notEqual(res.status, 500);
    });
    
    it('should reject objects in place of strings for Joi validation', async () => {
      const res = await request(app)
        .post('/api/v1/student/login')
        .send({ email: { "$ne": null }, password: { "$ne": null } });

      assert.equal(res.status, 400);
    });
  });

});
