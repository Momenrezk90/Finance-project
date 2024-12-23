const express = require('express');
const User = require('../models/User'); // Ensure correct path
const router = express.Router();

// Get all users for the manager to select from
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('-password'); // Exclude password field
    res.json(users);  // Send the users data without passwords
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});


// Get a specific user by their ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // Find user by ID
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);  // Return user data
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

module.exports = router;
