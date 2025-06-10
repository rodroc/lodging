import jwt from 'jsonwebtoken';
import { db } from '../db/setup.js';

export const authenticate = async (req, res, next) => {
  try {
    // Get token from httpOnly cookie instead of Authorization header
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication token required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Handle hardcoded admin user
    if (decoded.userId === 'admin' && decoded.isAdmin) {
      req.user = {
        id: 'admin',
        email: 'admin@lodging.com',
        name: 'Administrator',
        isAdmin: true
      };
      return next();
    }
    
    // Check if regular user exists in database
    const user = await db('users').where({ id: decoded.userId }).first();
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: decoded.isAdmin || false
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Not authorized' });
  }
};

// Middleware to check if user is admin
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  if (!req.user.isAdmin || req.user.email !== 'admin@lodging.com') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  
  next();
};