const express = require('express');
const router = express.Router();
const { signup, loginUser } = require('../controllers/authController'); // Adjust the path to where your controller is located

console.log('in authRoutes.js');

// Signup route
router.post('/signup', signup);

// Login route
router.post('/login', loginUser);

// Simple test route
router.get('/simple-test', (req, res) => {
    console.log('Simple test endpoint reached');
    res.send('Test successful');
});

module.exports = router;
