const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Format the response to match your frontend expectations
  res.json({
    name: user.name,
    email: user.email,
    joinDate: new Date(user.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }),
    avatar: user.avatar || 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png'
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.avatar) {
      user.avatar = req.body.avatar;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      joinDate: new Date(updatedUser.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }),
      avatar: updatedUser.avatar
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  getUserProfile,
  updateUserProfile
};