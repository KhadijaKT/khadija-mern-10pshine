const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getNotes,
  getNoteById,
  createNote, 
  updateNote, 
  deleteNote 
} = require('../controllers/noteControllers');

// @desc    Notes routes
// @route   /api/notes
// @access  Private (all routes protected)

// Get all notes & Create new note
router.route('/')
  .get(protect, getNotes)          // GET /api/notes
  .post(protect, createNote);      // POST /api/notes

// Get single note by ID
router.route('/:id')
  .get(protect, getNoteById);      // GET /api/notes/:id

// Update & Delete note
router.route('/:id')
  .put(protect, updateNote)        // PUT /api/notes/:id
  .delete(protect, deleteNote);    // DELETE /api/notes/:id

module.exports = router;