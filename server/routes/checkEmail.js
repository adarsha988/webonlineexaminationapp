const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Check if email exists
router.get('/check-email', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    res.json({ 
      exists: !!existingUser,
      email: email 
    });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
