const express = require('express');
const router = express.Router();

// مؤقتاً للتجربة - هتشتغل بأي username وكلمة سر 123456
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('📥 Student login attempt:', { username, password });
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  // تجربة بسيطة - أي username وكلمة سر 123456 تنجح
  if (password === '123456') {
    return res.json({
      token: 'test_token_' + Date.now(),
      student: {
        id: username,
        name: 'Student ' + username,
        level: 1,
        section: 'A'
      }
    });
  }
  
  return res.status(401).json({ message: 'Invalid credentials. Use password: 123456' });
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Student routes are working!' });
});

module.exports = router;