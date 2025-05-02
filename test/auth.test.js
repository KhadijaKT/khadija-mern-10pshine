// test/auth.test.js
const request = require('supertest');
const jwt = require('jsonwebtoken');
const assert = require('assert');
const{ app} = require('../app');
const User = require('../models/User');

describe('Authentication API', function () {
  let testUser;
  let authToken;

  before(async function () {
    await User.deleteMany({ email: 'auth_test@example.com' });

    testUser = new User({
      name: 'Auth Test User',
      email: 'auth_test@example.com',
      password: 'password123'
    });
    await testUser.save();

    authToken = jwt.sign(
      { id: testUser._id },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    );
  });

  after(async function () {
    await User.deleteMany({ email: 'auth_test@example.com' });
  });

  beforeEach(async function() {
    await User.deleteMany({});
  });

  describe('POST /api/auth/signup', function() {
    it('should register a new user', async function() {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);
      
      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.body.success, true);
      assert.ok(response.body.token);
    });
    
    it('should not register a user with existing email', async function() {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123'
      };
      
      await User.create(userData);
      
      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);
      
      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.body.success, false);
    });
  });

  describe('POST /api/auth/login', function() {
    it('should login an existing user', async function() {
      const userData = {
        name: 'Login User',
        email: 'login@example.com',
        password: 'password123'
      };
      
      const user = new User(userData);
      await user.save();
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });
      
      assert.strictEqual(loginResponse.status, 200);
      assert.ok(loginResponse.body.token);
      assert.ok(loginResponse.body.user);
    });
    
    it('should not login with incorrect password', async function() {
      const userData = {
        name: 'Wrong Password User',
        email: 'wrong@example.com',
        password: 'password123'
      };
      
      const user = new User(userData);
      await user.save();
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword'
        });
      
      assert.strictEqual(loginResponse.status, 401);
    });
    
    it('should not login with non-existent email', async function() {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });
      
      assert.strictEqual(loginResponse.status, 401);
    });
  });
});