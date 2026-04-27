const express = require('express');
const router = express.Router();
const StudentLog = require('../models/StudentLog');
const { adminAuth } = require('../middleware/auth'); // admin auth

router.get('/', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    
    const result = await StudentLog.getLogins(page, limit);
    res.json(result);
  } catch (error) {
    console.error('Error fetching student logs:', error);
    res.status(500).json({ message: 'Failed to fetch student logs' });
  }
});

module.exports = router;
