const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
dotenv.config();



// GET current user's role
// @route   GET /api/auth/role
// @desc    Get the role of the currently authenticated user
// @access  Protected (requires token)
router.get('/role', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('role'); // Extract role
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(user);
    res.json({ role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({ name, email, password, role });

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role // Include additional user data if needed
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }, // Optional: Token expiry time
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if user is admin
    // if (user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Access denied: Only admins can log in' });
    // }

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role // Include additional user data if needed
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }, // Optional: Token expiry time
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
