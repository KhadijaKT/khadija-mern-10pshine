const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// In your authController.js
const signup = asyncHandler(async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      // Check if MongoDB connection is ready
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ 
          success: false,
          message: 'Database not ready' 
        });
      }
  
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ 
          success: false,
          message: 'User already exists' 
        });
      }
  
      const user = await User.create({ name, email, password });
      
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: { 
          _id: user._id, 
          name: user.name, 
          email: user.email 
        }
      });
  
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  });

const loginUser = async (req, res) => {
    try {
      console.log('🔥 Controller entered - req.body:', req.body);
      
      if (!req.body.email || !req.body.password) {
        console.log('❌ Missing email or password');
        return res.status(400).json({ message: 'Email and password required' }).end();
      }
  
      const user = await User.findOne({ email: req.body.email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' }).end();
      }
  
      const isMatch = await user.matchPassword(req.body.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' }).end();
      }
  
      res.json({
        token: generateToken(user._id),
        user: { _id: user._id, name: user.name, email: user.email }
      }).end();
  
    } catch (err) {
      console.error('💥 Login error:', err);
      res.status(500).json({ message: 'Server error' }).end();
    }
  };

module.exports = { signup, loginUser };