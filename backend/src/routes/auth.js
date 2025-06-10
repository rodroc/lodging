import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/setup.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Hardcoded admin credentials
const ADMIN_EMAIL = 'admin@lodging.com';
const ADMIN_PASSWORD = 'admin';

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Prevent registration with admin email
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      return res.status(400).json({ message: 'This email address is not available for registration' });
    }
    
    // Check if user already exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
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
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Handle hardcoded admin login
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      if (password === ADMIN_PASSWORD) {
        // Generate token for admin
        const token = jwt.sign(
          { userId: 'admin', isAdmin: true },
          process.env.JWT_SECRET,
          { expiresIn: '1d' }
        );
        
        // Set httpOnly cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: false, // Set to false for HTTP connections
          sameSite: 'lax', // More permissive for HTTP
          maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        return res.json({
          user: {
            id: 'admin',
            name: 'Administrator',
            email: ADMIN_EMAIL,
            isAdmin: true
          }
        });
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }
    
    // Handle regular user login
    const user = await db('users').where({ email }).first();
    console.log({user})
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Regular users are not admin
    const isAdmin = false;
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to false for HTTP connections
      sameSite: 'lax', // More permissive for HTTP
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: false, // Set to false for HTTP connections
    sameSite: 'lax', // More permissive for HTTP
    expires: new Date(0)
  });
  
  res.json({ message: 'Logged out successfully' });
});

// Get current user (no CSRF needed for GET requests)
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;