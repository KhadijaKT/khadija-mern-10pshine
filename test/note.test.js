// test/note.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const assert = require('assert');
const jwt = require('jsonwebtoken');
const {app} = require('../app');
const Note = require('../models/Note');
const User = require('../models/User');

describe('Notes API', function () {
  this.timeout(10000);

  let testUser;
  let authToken;
  let testNoteId;

  before(async function () {
    console.log('Using existing database connection for Notes tests');

    testUser = new User({
      name: 'Notes Test User',
      email: 'notes_test@example.com',
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
    await Note.deleteMany({});
    await User.findByIdAndDelete(testUser._id);
    console.log('Notes test data cleaned up');
  });

  beforeEach(async function () {
    await Note.deleteMany({});

    const note = await Note.create({
      title: 'Test Note',
      content: 'This is a test note',
      user: testUser._id,
      fontFamily: 'Arial',
      isBold: false,
      isItalic: false,
      isUnderlined: false,
      backgroundColor: '#ffffff',
      textColor: '#000000'
    });

    testNoteId = note._id;
  });

  describe('POST /api/notes', function () {
    it('should create a new note', async function () {
      const noteData = {
        title: 'New Test Note',
        content: 'This is a new test note',
        fontFamily: 'Times New Roman',
        isBold: true,
        isItalic: false,
        isUnderlined: true,
        backgroundColor: '#f2f2f2',
        textColor: '#333333'
      };

      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(noteData);

      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.body.title, noteData.title);
      assert.strictEqual(response.body.content, noteData.content);
      assert.strictEqual(response.body.fontFamily, noteData.fontFamily);
      assert.strictEqual(response.body.isBold, noteData.isBold);
      assert.strictEqual(response.body.isUnderlined, noteData.isUnderlined);
      assert.strictEqual(response.body.backgroundColor, noteData.backgroundColor);
      assert.strictEqual(response.body.textColor, noteData.textColor);
      assert.strictEqual(response.body.user.toString(), testUser._id.toString());

      // Check that note actually exists in DB (don't rely on User.notes)
      const dbNote = await Note.findById(response.body._id);
      assert.ok(dbNote);
    });

    it('should return 400 if title is missing', async function () {
      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'This is a test note without title' });

      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.body.message, 'Title and content are required');
    });

    it('should return 400 if content is missing', async function () {
      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test Note Without Content' });

      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.body.message, 'Title and content are required');
    });

    it('should return 401 if not authenticated', async function () {
      const response = await request(app)
        .post('/api/notes')
        .send({ title: 'Unauthorized Note', content: 'This should not be created' });

      assert.strictEqual(response.status, 401);
    });
  });

  describe('GET /api/notes', function () {
    it('should get all notes for authenticated user', async function () {
      const response = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${authToken}`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.length, 1);
      assert.strictEqual(response.body[0].title, 'Test Note');
      assert.strictEqual(response.body[0].content, 'This is a test note');
    });

    it('should return empty array if user has no notes', async function () {
      await Note.deleteMany({ user: testUser._id });

      const response = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${authToken}`);

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.body, []);
    });

    it('should return 401 if not authenticated', async function () {
      const response = await request(app).get('/api/notes');
      assert.strictEqual(response.status, 401);
    });
  });

  describe('GET /api/notes/:id', function () {
    it('should get a specific note by ID', async function () {
      const response = await request(app)
        .get(`/api/notes/${testNoteId}`)
        .set('Authorization', `Bearer ${authToken}`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body._id.toString(), testNoteId.toString());
    });

    it('should return 404 if note does not exist', async function () {
      const fakeNoteId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/notes/${fakeNoteId}`)
        .set('Authorization', `Bearer ${authToken}`);

      assert.strictEqual(response.status, 404);
    });

    it('should return 401 if not authenticated', async function () {
      const response = await request(app).get(`/api/notes/${testNoteId}`);
      assert.strictEqual(response.status, 401);
    });
  });
  
  describe('PUT /api/notes/:id', function() {
    it('should update an existing note', async function() {
      const updateData = {
        title: 'Updated Test Note',
        content: 'This note has been updated',
        fontFamily: 'Helvetica',
        isBold: true,
        isItalic: true,
        backgroundColor: '#e0e0e0',
        textColor: '#222222'
      };
      
      const response = await request(app)
        .put(`/api/notes/${testNoteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);
      
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.title, updateData.title);
      assert.strictEqual(response.body.content, updateData.content);
      assert.strictEqual(response.body.fontFamily, updateData.fontFamily);
      assert.strictEqual(response.body.isBold, updateData.isBold);
      assert.strictEqual(response.body.isItalic, updateData.isItalic);
      assert.strictEqual(response.body.backgroundColor, updateData.backgroundColor);
      assert.strictEqual(response.body.textColor, updateData.textColor);
      
      // Verify in database
      const updatedNote = await Note.findById(testNoteId);
      assert.strictEqual(updatedNote.title, updateData.title);
    });
    
    it('should partially update a note', async function() {
      const partialUpdateData = {
        title: 'Partially Updated Note'
        // Other fields omitted
      };
      
      const response = await request(app)
        .put(`/api/notes/${testNoteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(partialUpdateData);
      
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.title, partialUpdateData.title);
      assert.strictEqual(response.body.content, 'This is a test note'); // Original content unchanged
    });
    
    it('should return 404 if note does not exist', async function() {
      const fakeNoteId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/notes/${fakeNoteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' });
      
      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.body.message, 'Note not found');
    });
    
    it('should return 403 if user does not own the note', async function() {
      // Create another user
      const anotherUser = new User({
        name: 'Another Test User',
        email: 'another_test@example.com',
        password: 'password123',
        notes: [] // Initialize notes array
      });
      await anotherUser.save();
      
      // Create token for another user
      const anotherUserToken = jwt.sign(
        { id: anotherUser._id },
        process.env.JWT_SECRET || 'testsecret',
        { expiresIn: '1h' }
      );
      
      const response = await request(app)
        .put(`/api/notes/${testNoteId}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .send({ title: 'Unauthorized Update' });
      
      assert.strictEqual(response.status, 403);
      assert.strictEqual(response.body.message, 'Unauthorized');
      
      // Clean up
      await User.findByIdAndDelete(anotherUser._id);
    });
    
    it('should return 401 if not authenticated', async function() {
      const response = await request(app)
        .put(`/api/notes/${testNoteId}`)
        .send({ title: 'Unauthorized Update' });
      
      assert.strictEqual(response.status, 401);
    });
  });
  
  describe('DELETE /api/notes/:id', function() {
    it('should delete a note', async function() {
      const response = await request(app)
        .delete(`/api/notes/${testNoteId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.message, 'Note removed');
      assert.strictEqual(response.body.deletedNoteId.toString(), testNoteId.toString());
      
      // Verify note is deleted
      const deletedNote = await Note.findById(testNoteId);
      assert.strictEqual(deletedNote, null);
      
      // Verify reference removed from user - fixed to handle potential undefined notes array
      const updatedUser = await User.findById(testUser._id);
      const userNotes = updatedUser.notes || [];
      const hasNoteRef = userNotes.some(noteId => 
        noteId.toString() === testNoteId.toString()
      );
      assert.strictEqual(hasNoteRef, false);
    });
    
    it('should return 404 if note does not exist', async function() {
      const fakeNoteId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/notes/${fakeNoteId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.body.message, 'Note not found');
    });
    
    it('should return 401 if not authenticated', async function() {
      const response = await request(app)
        .delete(`/api/notes/${testNoteId}`);
      
      assert.strictEqual(response.status, 401);
    });
  });
});