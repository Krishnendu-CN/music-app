const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// GET all users
// @route   GET /api/users
// @desc    Get all users
// @access  Protected (requires token)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password field from response
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// GET a specific user by ID
// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Protected (requires token)
router.get('/:id', authMiddleware, getUser, (req, res) => {
  res.json(res.user);
});

// POST create a new user
// @route   POST /api/users
// @desc    Create a new user
// @access  Protected (requires token)
router.post('/', authMiddleware, async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const newUser = new User({ name, email, password, role });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update a user by ID
// @route   PATCH /api/users/:id
// @desc    Update a user by ID
// @access  Protected (requires token)
router.patch('/:id', authMiddleware, getUser, async (req, res) => {
  if (req.body.name != null) {
    res.user.name = req.body.name;
  }
  if (req.body.email != null) {
    res.user.email = req.body.email;
  }
  if (req.body.role != null) {
    res.user.role = req.body.role;
  }
  try {
    const updatedUser = await res.user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a user by ID
// @route   DELETE /api/users/:id
// @desc    Delete a user by ID
// @access  Protected (requires token)
router.delete('/:id', authMiddleware, getUser, async (req, res) => {
  //console.log(res.user);
  try {
    await res.user.deleteOne(); 
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Middleware to get user by ID
async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  res.user = user;
  next();
}

module.exports = router;
