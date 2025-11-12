import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { authenticateToken } from '../middleware/auth.ts';

const router = express.Router();

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email address. Please check your email or register for a new account.',
        errorType: 'USER_NOT_FOUND'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please check your password and try again.',
        errorType: 'INVALID_PASSWORD'
      });
    }

    // Check if user account is active
    if (user.status !== 'active') {
      let message = '';
      let errorType = '';
      
      switch (user.status) {
        case 'inactive':
          message = 'Your account is currently inactive. Please contact the administrator to activate your account.';
          errorType = 'ACCOUNT_INACTIVE';
          break;
        case 'suspended':
          message = 'Your account has been suspended. Please contact the administrator for assistance.';
          errorType = 'ACCOUNT_SUSPENDED';
          break;
        default:
          message = 'Your account status does not allow login. Please contact the administrator.';
          errorType = 'ACCOUNT_STATUS_INVALID';
      }
      
      return res.status(403).json({
        success: false,
        message,
        errorType,
        accountStatus: user.status
      });
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/register - User registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      profile: {
        studentId: role === 'student' ? `STU${Date.now()}` : undefined,
        department: 'Computer Science', // Default department
        phone: '',
        address: ''
      }
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser._id, 
        email: newUser.email, 
        role: newUser.role 
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just send a success response
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
