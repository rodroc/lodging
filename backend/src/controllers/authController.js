const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const db = require('../db/connection');
const { generateToken } = require('../utils/jwt');

// Register a new user
exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    // Check if email already exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({
        status: 'failed',
        message: 'Email already in use'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const [userId] = await db('users').insert({
      name,
      email,
      password: hashedPassword
    }).returning('id');

    // Generate JWT token
    const token = generateToken(userId);

    // Get the created user (without password)
    const user = await db('users')
      .select('id', 'name', 'email', 'created_at', 'updated_at')
      .where({ id: userId })
      .first();

    // Set token cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to false for HTTP connections
      sameSite: 'lax', // More permissive for HTTP
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(201).json({
      status: 'success',
      token,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid credentials'
      });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Set token cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to false for HTTP connections
      sameSite: 'lax', // More permissive for HTTP
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(200).json({
      status: 'success',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Logout user
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: false, // Set to false for HTTP connections
    sameSite: 'lax' // More permissive for HTTP
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await db('users')
      .select('id', 'name', 'email', 'created_at', 'updated_at')
      .where({ id: req.user.id })
      .first();

    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};


