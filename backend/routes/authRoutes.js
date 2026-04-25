const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  
  console.log(`[Backend] Registration attempt for: ${email}`); // Added for debugging

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log(`[Backend] Registration failed: User ${email} already exists`);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate Student Email
    if (role === 'Student') {
      const isEduEmail = email.endsWith('.edu') || email.endsWith('.ac.in');
      if (!isEduEmail) {
        return res.status(400).json({ message: 'Students must use a valid institute email ID.' });
      }
    }

    const user = await User.create({ name, email, password, role });
    
    console.log(`[Backend] Registration SUCCESS for: ${email}`);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(`[Backend] Registration Error:`, error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log(`[Backend] Login attempt for: ${email}`); // Added for debugging

  try {
    // 1. Check if user exists
    const user = await User.findOne({ email });

    // 2. If user exists AND password matches using the method from our User model
    if (user && (await user.matchPassword(password))) {
      console.log(`[Backend] Login SUCCESS for: ${email}`);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      // 3. If wrong email or password
      console.log(`[Backend] Login FAILED for: ${email} (Invalid credentials)`);
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(`[Backend] Login Error:`, error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;