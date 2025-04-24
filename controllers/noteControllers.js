const Note = require('../models/Note');
const User = require('../models/User');

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
  try {
    const { 
      title, 
      content, 
      fontFamily, 
      isBold, 
      isItalic, 
      isUnderlined, 
      backgroundColor, 
      textColor 
    } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Create the note with user reference
    const note = await Note.create({
      title,
      content,
      user: req.user.id,
      fontFamily: fontFamily || 'Arial',
      isBold: isBold || false,
      isItalic: isItalic || false,
      isUnderlined: isUnderlined || false,
      backgroundColor: backgroundColor || '#ffffff',
      textColor: textColor || '#000000'
    });
    
    // Add note reference to user's notes array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { notes: note._id } },
      { new: true }
    );
    
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all notes for authenticated user
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
  try {
    // Find notes that belong to the authenticated user
    const notes = await Note.find({ user: req.user.id })
      .sort({ createdAt: -1 }); // Sort by most recent first
    
    if (!notes || notes.length === 0) {
      return res.status(200).json([]); // Return empty array if no notes found
    }
    
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single note
// @route   GET /api/notes/:id
// @access  Private
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
  const {
    title, content, fontFamily,
    isBold, isItalic, isUnderlined,
    backgroundColor, textColor
  } = req.body;

  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.user.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    note.title = title ?? note.title;
    note.content = content ?? note.content;
    note.fontFamily = fontFamily ?? note.fontFamily;
    note.isBold = isBold ?? note.isBold;
    note.isItalic = isItalic ?? note.isItalic;
    note.isUnderlined = isUnderlined ?? note.isUnderlined;
    note.backgroundColor = backgroundColor ?? note.backgroundColor;
    note.textColor = textColor ?? note.textColor;

    const updated = await note.save();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the note, verifying ownership
    const note = await Note.findOneAndDelete({ _id: id, user: req.user.id });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Remove note reference from user's notes array
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { notes: note._id } }
    );

    res.json({ 
      message: 'Note removed',
      deletedNoteId: note._id 
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  createNote, 
  getNotes, 
  getNoteById,
  updateNote, 
  deleteNote 
};