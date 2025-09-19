import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateToken, auth, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateSignup = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
];

const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', validateSignup, handleValidationErrors, async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email },
        { username: username }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email or username'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      fullName
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully. Awaiting approval.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by credentials
    const user = await User.findByCredentials(username, password);

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      message: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      fullName: req.user.fullName,
      role: req.user.role,
      status: req.user.status,
      lastLogin: req.user.lastLogin,
      createdAt: req.user.createdAt
    }
  });
});

// @route   GET /api/auth/pending-users
// @desc    Get all pending users (Super Admin only)
// @access  Private (Super Admin)
router.get('/pending-users', auth, requireSuperAdmin, async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Transform the users to include 'id' instead of '_id'
    const transformedUsers = pendingUsers.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      status: user.status,
      role: user.role,
      createdAt: user.createdAt
    }));

    res.json({
      users: transformedUsers,
      count: transformedUsers.length
    });
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({
      message: 'Server error while fetching pending users'
    });
  }
});

// @route   POST /api/auth/approve-user/:userId
// @desc    Approve a user (Super Admin only)
// @access  Private (Super Admin)
router.post('/approve-user/:userId', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({
        message: 'User is not in pending status'
      });
    }

    // Update user status
    user.status = 'approved';
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();
    
    await user.save();

    res.json({
      message: 'User approved successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        approvedAt: user.approvedAt
      }
    });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({
      message: 'Server error while approving user'
    });
  }
});

// @route   POST /api/auth/reject-user/:userId
// @desc    Reject a user (Super Admin only)
// @access  Private (Super Admin)
router.post('/reject-user/:userId', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({
        message: 'User is not in pending status'
      });
    }

    // Update user status
    user.status = 'rejected';
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();
    
    await user.save();

    res.json({
      message: 'User rejected successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({
      message: 'Server error while rejecting user'
    });
  }
});

export default router;