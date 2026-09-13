const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const User = require('../models/User'); // Import your User model
const { authenticateAdmin } = require('../middleware/authMiddleware'); // Import JWT middleware

// ==========================================
// PUBLIC AUTHENTICATION ROUTES
// ==========================================

router.post('/register', register);
router.post('/login', login);

// Initiate Google Login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth Callback Route
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: 'https://campusflow19.netlify.app/login' }),
  (req, res) => {
    // Generate JWT token for the authenticated user
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Redirect back to frontend with the session token
    res.redirect(`https://campusflow19.netlify.app/dashboard?token=${token}`);
  }
);

// ==========================================
// PROTECTED USER / PROFILE ROUTES
// ==========================================

// GET /api/auth/me - Fetch authenticated user profile based on JWT
router.get('/me', authenticateAdmin, async (req, res) => {
  try {
    // req.user.id is populated by authenticateAdmin middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

// PUT /api/auth/profile - Update user profile details
// PUT /api/auth/profile - Update user profile details
router.put('/profile', authenticateAdmin, async (req, res) => {
  try {
    // Accept either format to be completely safe
    const fullName = req.body.fullName || req.body.name;
    const email = req.body.email;
    const collegeName = req.body.collegeName || req.body.college;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        fullName: fullName ? fullName.trim() : undefined, 
        email: email ? email.trim().toLowerCase() : undefined,
        collegeName: collegeName !== undefined ? collegeName.trim() : undefined
      },
      { new: true, runValidators: true } // 'new: true' returns the updated document
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
});

module.exports = router;