const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { studentAuth } = require('../middleware/studentAuth');

router.post('/chat', studentAuth, aiController.chat);

module.exports = router;
