const express = require('express');
const router = express.Router();
const { studentAuth } = require('../middleware/studentAuth');
const { uploadMaterial, handleMulterError } = require('../middleware/upload');
const {
  getPosts,
  createPost,
  reviewPost,
  deletePost,
  toggleUpvote,
  toggleBookmark,
  getComments,
  addComment,
  deleteComment
} = require('../controllers/materialHubController');

// All endpoints require student authentication
router.get('/:courseId', studentAuth, getPosts);
router.post('/', studentAuth, uploadMaterial.single('file'), handleMulterError, createPost);
router.patch('/:id/review', studentAuth, reviewPost);
router.delete('/:id', studentAuth, deletePost);

// Upvote, Bookmark & Comments routes
router.post('/:id/upvote', studentAuth, toggleUpvote);
router.post('/:id/bookmark', studentAuth, toggleBookmark);
router.get('/:id/comments', studentAuth, getComments);
router.post('/:id/comments', studentAuth, addComment);
router.delete('/comments/:commentId', studentAuth, deleteComment);

module.exports = router;
