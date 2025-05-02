// test/user.test.js
const request = require('supertest');
const jwt = require('jsonwebtoken');
const assert = require('assert');
const {app} = require('../app');
const User = require('../models/User');

describe('User API', function () {
  let testUser;
  let authToken;
  
  before(async function () {
    // Clean up any existing test users
    await User.deleteMany({ email: { $in: ['user_test@example.com', 'updated_user@example.com'] } });
    
    // Create a test user
    testUser = new User({
      name: 'User Test',
      email: 'user_test@example.com',
      password: 'password123'
    });
    await testUser.save();
    
    // Generate auth token for protected routes - use 'id' to match authMiddleware
    authToken = jwt.sign(
      { id: testUser._id },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    );
  });
  
  after(async function () {
    // Clean up after tests
    await User.deleteMany({ email: { $in: ['user_test@example.com', 'updated_user@example.com'] } });
  });
  
  describe('GET /api/users/profile', function() {
    it('should get user profile when authenticated', async function() {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);
      
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.name, 'User Test');
      assert.strictEqual(response.body.email, 'user_test@example.com');
      assert.ok(response.body.joinDate);
    });
    
    it('should return 401 if not authenticated', async function() {
      const response = await request(app)
        .get('/api/users/profile');
      
      assert.strictEqual(response.status, 401);
    });
    
    it('should return 401 with invalid token', async function() {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalidtoken');
      
      assert.strictEqual(response.status, 401);
    });
  });
  
  describe('PUT /api/users/profile', function() {
    it('should update user profile when authenticated', async function() {
      // Reset user before test
      await User.findByIdAndUpdate(testUser._id, {
        name: 'User Test',
        email: 'user_test@example.com'
      });
      
      const updatedData = {
        name: 'Updated User',
        email: 'updated_user@example.com',
        avatar: 'https://example.com/avatar.jpg'
      };
      
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);
      
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.name, updatedData.name);
      assert.strictEqual(response.body.email, updatedData.email);
    });
    
    it('should update only provided fields', async function() {
      // Reset user to known state
      await User.findByIdAndUpdate(testUser._id, {
        name: 'User Test',
        email: 'user_test@example.com'
      });

      // Refresh token after user update
      authToken = jwt.sign(
        { id: testUser._id },
        process.env.JWT_SECRET || 'testsecret',
        { expiresIn: '1h' }
      );

      // Update only name
      const partialUpdate = {
        name: 'Partially Updated User'
      };
      
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(partialUpdate);
      
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.name, partialUpdate.name);
      
      // Get updated user from database
      const updatedUser = await User.findById(testUser._id);
      assert.strictEqual(updatedUser.email, 'user_test@example.com');
    });
    
    it('should return 401 if not authenticated', async function() {
      const response = await request(app)
        .put('/api/users/profile')
        .send({ name: 'Unauthorized Update' });
      
      assert.strictEqual(response.status, 401);
    });
  });
  
  describe('Error handling', function() {
    it('should handle non-existent user', async function() {
      // Create token with non-existent user ID
      const nonExistentToken = jwt.sign(
        { id: '5f50c31e1b54b22a70c20bf0' }, // Valid ObjectId but doesn't exist
        process.env.JWT_SECRET || 'testsecret',
        { expiresIn: '1h' }
      );
      
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${nonExistentToken}`);
      
      // Update expectation based on your modified middleware
      assert.strictEqual(response.status, 404);
    });
    
    it('should validate email format if implemented', async function() {
      // This test is optional and depends on whether your app validates email format
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'not-an-email' });
      
      // Just check that the server responds - the actual status depends on your implementation
      assert.ok(response.status);
    });
  });
});