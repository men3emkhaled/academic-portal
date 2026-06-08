const express = require('express');
const router = express.Router();
const { studentAuth } = require('../middleware/studentAuth');
const { uploadMaterial, handleMulterError } = require('../middleware/upload');
const {
  getPosts,
  createPost,
  reviewPost,
  deletePost
} = require('../controllers/materialHubController');

// All endpoints require student authentication
router.get('/:courseId', studentAuth, getPosts);
router.post('/', studentAuth, uploadMaterial.single('file'), handleMulterError, createPost);
router.patch('/:id/review', studentAuth, reviewPost);
router.delete('/:id', studentAuth, deletePost);

module.exports = router;
