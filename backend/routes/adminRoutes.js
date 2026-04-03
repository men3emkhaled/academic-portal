const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const studentController = require('../controllers/studentController');
const upload = require('../middleware/upload');

router.post('/login', adminController.login);
router.post('/upload-students', upload.single('file'), studentController.uploadStudentsExcel);

module.exports = router;