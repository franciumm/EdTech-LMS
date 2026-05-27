import { Buffer } from 'node:buffer';
global.SlowBuffer = Buffer;
import { setupTestDB, teardownTestDB } from './setup.js';
import { describe, it, beforeEach, afterEach, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../api/index.js';
import mongoose from 'mongoose';
import { assignmentModel } from '../DB/models/assignment.model.js';
import { teacherModel } from '../DB/models/teacher.model.js';
import jwt from 'jsonwebtoken';

let adminToken = '';

describe('API Security Testing - Search (ReDoS & Data Leakage)', () => {
  before(async () => {
    await setupTestDB();
  });

  after(async () => {
    await teardownTestDB();
  });
  
  beforeEach(async () => {
    // Seed some mock data
    await assignmentModel.deleteMany({});
    await assignmentModel.create({
      name: 'Math Assignment 1',
      description: 'Solve the equations',
      groupId: [new mongoose.Types.ObjectId()],
      createdBy: new mongoose.Types.ObjectId(),
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000)
    });
    
    // Create an admin user for the tests
    await teacherModel.deleteMany({});
    const admin = await teacherModel.create({
      name: 'Admin',
      email: 'admin@edu.com',
      password: 'hashedpassword',
      role: 'main_teacher'
    });
    
    // Generate token
    adminToken = jwt.sign(
      { _id: admin._id, type: 'access', role: admin.role },
      process.env.JWT_SECRET || 'test'
    );
  });

  describe('ReDoS Prevention', () => {
    it('should neutralize regex control characters and not crash the server', async () => {
      // The attack string contains unescaped regex metacharacters that cause catastrophic backtracking
      const maliciousQuery = '.*.*.*.*.*.*.*.*.*.*a';
      
      const startTime = Date.now();
      const res = await request(app)
        .get(`/api/v1/search/content?type=assignment&q=${encodeURIComponent(maliciousQuery)}`)
        .set('Authorization', `MonaEdu ${adminToken}`);
      
      const duration = Date.now() - startTime;
      
      // If ReDoS is prevented, the server will respond very quickly (under 500ms usually)
      assert.ok(duration < 1000); 
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
      assert.equal(res.body.data.length, 0);
    });
  });

  describe('Data Leakage Prevention', () => {
    it('should only return id and name, and not leak other document fields', async () => {
      const res = await request(app)
        .get('/api/v1/search/content?type=assignment&q=Math')
        .set('Authorization', `MonaEdu ${adminToken}`);

      assert.equal(res.status, 200);
      assert.ok(res.body.data.length > 0);
      
      const firstResult = res.body.data[0];
      
      // Verify only id and name are present
      assert.ok('id' in firstResult);
      assert.ok('name' in firstResult);
      assert.ok(!('description' in firstResult));
      assert.ok(!('groupId' in firstResult));
    });
  });

});
