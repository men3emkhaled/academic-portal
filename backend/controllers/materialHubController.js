const db = require('../config/database');
const supabase = require('../config/supabase');
const path = require('path');

// Get all posts for a course
const getPosts = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;
    
    // Check if user has permission to review (is admin or has manage_resources permission)
    const perms = req.user.permissions || [];
    const isReviewer = req.user.role === 'admin' || perms.includes('manage_resources');
    
    // Get student's batch
    const studentResult = await db.query(
      'SELECT batch FROM students WHERE id = $1',
      [studentId]
    );
    const studentBatch = studentResult.rows[0]?.batch || 2025;

    const reqBatch = req.query.batch;
    
    let queryText;
    let queryParams;

    if (isReviewer) {
      // Reviewers can see all posts (pending, approved, rejected)
      if (reqBatch === 'all') {
        queryText = `
          SELECT 
            p.*, 
            s.name as student_name, 
            s.avatar_url as student_avatar_url, 
            rev.name as reviewer_name,
            COALESCE(u.upvotes_count, 0)::INTEGER as upvotes_count,
            COALESCE(c.comments_count, 0)::INTEGER as comments_count,
            EXISTS(SELECT 1 FROM material_hub_upvotes WHERE post_id = p.id AND student_id = $2) as has_upvoted,
            EXISTS(SELECT 1 FROM material_hub_bookmarks WHERE post_id = p.id AND student_id = $2) as has_bookmarked
          FROM material_hub_posts p
          LEFT JOIN students s ON p.student_id = s.id
          LEFT JOIN students rev ON p.reviewed_by = rev.id
          LEFT JOIN (
            SELECT post_id, COUNT(*) as upvotes_count 
            FROM material_hub_upvotes 
            GROUP BY post_id
          ) u ON p.id = u.post_id
          LEFT JOIN (
            SELECT post_id, COUNT(*) as comments_count 
            FROM material_hub_comments 
            GROUP BY post_id
          ) c ON p.id = c.post_id
          WHERE p.course_id = $1
          ORDER BY p.batch DESC, p.created_at DESC
        `;
        queryParams = [courseId, studentId];
      } else {
        const filterBatch = reqBatch ? parseInt(reqBatch, 10) : studentBatch;
        queryText = `
          SELECT 
            p.*, 
            s.name as student_name, 
            s.avatar_url as student_avatar_url, 
            rev.name as reviewer_name,
            COALESCE(u.upvotes_count, 0)::INTEGER as upvotes_count,
            COALESCE(c.comments_count, 0)::INTEGER as comments_count,
            EXISTS(SELECT 1 FROM material_hub_upvotes WHERE post_id = p.id AND student_id = $2) as has_upvoted,
            EXISTS(SELECT 1 FROM material_hub_bookmarks WHERE post_id = p.id AND student_id = $2) as has_bookmarked
          FROM material_hub_posts p
          LEFT JOIN students s ON p.student_id = s.id
          LEFT JOIN students rev ON p.reviewed_by = rev.id
          LEFT JOIN (
            SELECT post_id, COUNT(*) as upvotes_count 
            FROM material_hub_upvotes 
            GROUP BY post_id
          ) u ON p.id = u.post_id
          LEFT JOIN (
            SELECT post_id, COUNT(*) as comments_count 
            FROM material_hub_comments 
            GROUP BY post_id
          ) c ON p.id = c.post_id
          WHERE p.course_id = $1 AND p.batch = $3
          ORDER BY p.created_at DESC
        `;
        queryParams = [courseId, studentId, filterBatch];
      }
    } else {
      // Normal students only see approved posts OR their own posts
      if (reqBatch === 'all') {
        queryText = `
          SELECT 
            p.*, 
            s.name as student_name, 
            s.avatar_url as student_avatar_url, 
            rev.name as reviewer_name,
            COALESCE(u.upvotes_count, 0)::INTEGER as upvotes_count,
            COALESCE(c.comments_count, 0)::INTEGER as comments_count,
            EXISTS(SELECT 1 FROM material_hub_upvotes WHERE post_id = p.id AND student_id = $2) as has_upvoted,
            EXISTS(SELECT 1 FROM material_hub_bookmarks WHERE post_id = p.id AND student_id = $2) as has_bookmarked
          FROM material_hub_posts p
          LEFT JOIN students s ON p.student_id = s.id
          LEFT JOIN students rev ON p.reviewed_by = rev.id
          LEFT JOIN (
            SELECT post_id, COUNT(*) as upvotes_count 
            FROM material_hub_upvotes 
            GROUP BY post_id
          ) u ON p.id = u.post_id
          LEFT JOIN (
            SELECT post_id, COUNT(*) as comments_count 
            FROM material_hub_comments 
            GROUP BY post_id
          ) c ON p.id = c.post_id
          WHERE p.course_id = $1 AND (p.status = 'approved' OR p.student_id = $2)
          ORDER BY p.batch DESC, p.created_at DESC
        `;
        queryParams = [courseId, studentId];
      } else {
        const filterBatch = reqBatch ? parseInt(reqBatch, 10) : studentBatch;
        queryText = `
          SELECT 
            p.*, 
            s.name as student_name, 
            s.avatar_url as student_avatar_url, 
            rev.name as reviewer_name,
            COALESCE(u.upvotes_count, 0)::INTEGER as upvotes_count,
            COALESCE(c.comments_count, 0)::INTEGER as comments_count,
            EXISTS(SELECT 1 FROM material_hub_upvotes WHERE post_id = p.id AND student_id = $2) as has_upvoted,
            EXISTS(SELECT 1 FROM material_hub_bookmarks WHERE post_id = p.id AND student_id = $2) as has_bookmarked
          FROM material_hub_posts p
          LEFT JOIN students s ON p.student_id = s.id
          LEFT JOIN students rev ON p.reviewed_by = rev.id
          LEFT JOIN (
            SELECT post_id, COUNT(*) as upvotes_count 
            FROM material_hub_upvotes 
            GROUP BY post_id
          ) u ON p.id = u.post_id
          LEFT JOIN (
            SELECT post_id, COUNT(*) as comments_count 
            FROM material_hub_comments 
            GROUP BY post_id
          ) c ON p.id = c.post_id
          WHERE p.course_id = $1 AND (p.status = 'approved' OR p.student_id = $2) AND p.batch = $3
          ORDER BY p.created_at DESC
        `;
        queryParams = [courseId, studentId, filterBatch];
      }
    }

    const result = await db.query(queryText, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching material hub posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new post
const createPost = async (req, res) => {
  try {
    const { courseId, type, caption, batch } = req.body;
    const studentId = req.user.id;

    if (!courseId || !type) {
      return res.status(400).json({ message: 'Course ID and type are required' });
    }

    if (!['lecture', 'exam'].includes(type)) {
      return res.status(400).json({ message: 'Type must be "lecture" or "exam"' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'A file upload is required' });
    }

    const file = req.file;
    const fileExt = path.extname(file.originalname);
    const cleanFileName = path.basename(file.originalname, fileExt).replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `material_${studentId}_${Date.now()}_${cleanFileName}${fileExt}`;
    const filePath = `materials/${fileName}`;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('material-hub')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({ message: 'Failed to upload file to storage bucket "material-hub". Ensure bucket exists and has public access.' });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('material-hub')
      .getPublicUrl(filePath);

    // If poster is admin, has manage_resources (reviewer), or manage_material_hub (trusted publisher), approve instantly
    const perms = req.user.permissions || [];
    const isTrustedPublisher = req.user.role === 'admin' || perms.includes('manage_resources') || perms.includes('manage_material_hub');
    const initialStatus = isTrustedPublisher ? 'approved' : 'pending';

    // Get student's batch
    const studentResult = await db.query(
      'SELECT batch FROM students WHERE id = $1',
      [studentId]
    );
    const studentBatch = studentResult.rows[0]?.batch || 2025;
    const postBatch = batch ? parseInt(batch, 10) : studentBatch;

    const insertQuery = `
      INSERT INTO material_hub_posts (
        course_id, student_id, type, caption, file_url, file_name, file_size, status, batch
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await db.query(insertQuery, [
      courseId,
      studentId,
      type,
      caption || '',
      publicUrl,
      file.originalname,
      file.size,
      initialStatus,
      postBatch
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating material hub post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Review or update a post
const reviewPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectReason, batch, caption, type } = req.body;
    const reviewerId = req.user.id;

    const isReviewer = req.user.role === 'admin' || (req.user.permissions || []).includes('manage_resources');
    
    const checkQuery = await db.query('SELECT * FROM material_hub_posts WHERE id = $1', [id]);
    if (checkQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const post = checkQuery.rows[0];

    // Only owner or reviewer can edit/moderate
    if (!isReviewer && post.student_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You do not have permission to modify this material.' });
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (status !== undefined) {
      if (!isReviewer) {
        return res.status(403).json({ message: 'Access denied. Only moderators can change status.' });
      }
      if (!['approved', 'rejected', 'pending'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      updates.push(`status = $${idx++}`); values.push(status);
      
      if (status === 'rejected') {
        updates.push(`reject_reason = $${idx++}`); values.push(rejectReason || '');
      } else {
        updates.push(`reject_reason = $${idx++}`); values.push(null);
      }
      updates.push(`reviewed_by = $${idx++}`); values.push(reviewerId);
      updates.push(`reviewed_at = CURRENT_TIMESTAMP`);
    }

    if (batch !== undefined) {
      updates.push(`batch = $${idx++}`); values.push(parseInt(batch, 10));
    }
    if (caption !== undefined) {
      updates.push(`caption = $${idx++}`); values.push(caption);
    }
    if (type !== undefined) {
      if (!['lecture', 'exam'].includes(type)) {
        return res.status(400).json({ message: 'Type must be "lecture" or "exam"' });
      }
      updates.push(`type = $${idx++}`); values.push(type);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);
    const updateQuery = `
      UPDATE material_hub_posts 
      SET ${updates.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;

    const result = await db.query(updateQuery, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error reviewing/updating material hub post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const postQuery = await db.query('SELECT * FROM material_hub_posts WHERE id = $1', [id]);
    if (postQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = postQuery.rows[0];
    const isReviewer = req.user.role === 'admin' || (req.user.permissions || []).includes('manage_resources');
    const isOwner = post.student_id === userId;

    if (!isReviewer && !isOwner) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own posts.' });
    }

    // Delete record from DB
    await db.query('DELETE FROM material_hub_posts WHERE id = $1', [id]);

    // Optional: Delete from Supabase storage (handled gracefully)
    try {
      const urlParts = post.file_url.split('/material-hub/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('material-hub').remove([filePath]);
      }
    } catch (storageErr) {
      console.warn('Could not delete file from Supabase storage:', storageErr.message);
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting material hub post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Toggle upvote on a post
const toggleUpvote = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    // Check if post exists
    const checkPost = await db.query('SELECT id FROM material_hub_posts WHERE id = $1', [id]);
    if (checkPost.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already upvoted
    const checkUpvote = await db.query(
      'SELECT id FROM material_hub_upvotes WHERE post_id = $1 AND student_id = $2',
      [id, studentId]
    );

    if (checkUpvote.rows.length > 0) {
      // Remove upvote
      await db.query('DELETE FROM material_hub_upvotes WHERE post_id = $1 AND student_id = $2', [id, studentId]);
      res.json({ upvoted: false });
    } else {
      // Add upvote
      await db.query('INSERT INTO material_hub_upvotes (post_id, student_id) VALUES ($1, $2)', [id, studentId]);
      res.json({ upvoted: true });
    }
  } catch (error) {
    console.error('Error toggling upvote:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Toggle bookmark on a post
const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    // Check if post exists
    const checkPost = await db.query('SELECT id FROM material_hub_posts WHERE id = $1', [id]);
    if (checkPost.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already bookmarked
    const checkBookmark = await db.query(
      'SELECT id FROM material_hub_bookmarks WHERE post_id = $1 AND student_id = $2',
      [id, studentId]
    );

    if (checkBookmark.rows.length > 0) {
      // Remove bookmark
      await db.query('DELETE FROM material_hub_bookmarks WHERE post_id = $1 AND student_id = $2', [id, studentId]);
      res.json({ bookmarked: false });
    } else {
      // Add bookmark
      await db.query('INSERT INTO material_hub_bookmarks (post_id, student_id) VALUES ($1, $2)', [id, studentId]);
      res.json({ bookmarked: true });
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get comments for a post
const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    const queryText = `
      SELECT 
        c.*, 
        s.name as student_name, 
        s.avatar_url as student_avatar_url
      FROM material_hub_comments c
      LEFT JOIN students s ON c.student_id = s.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `;
    const result = await db.query(queryText, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add comment to a post
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const studentId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    // Check if post exists
    const checkPost = await db.query('SELECT id FROM material_hub_posts WHERE id = $1', [id]);
    if (checkPost.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const insertQuery = `
      INSERT INTO material_hub_comments (post_id, student_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const commentResult = await db.query(insertQuery, [id, studentId, content.trim()]);
    
    // Return with student info
    const fullCommentQuery = `
      SELECT 
        c.*, 
        s.name as student_name, 
        s.avatar_url as student_avatar_url
      FROM material_hub_comments c
      LEFT JOIN students s ON c.student_id = s.id
      WHERE c.id = $1
    `;
    const result = await db.query(fullCommentQuery, [commentResult.rows[0].id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const commentQuery = await db.query('SELECT * FROM material_hub_comments WHERE id = $1', [commentId]);
    if (commentQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const comment = commentQuery.rows[0];
    const isReviewer = req.user.role === 'admin' || (req.user.permissions || []).includes('manage_resources');
    const isOwner = comment.student_id === userId;

    if (!isReviewer && !isOwner) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own comments.' });
    }

    await db.query('DELETE FROM material_hub_comments WHERE id = $1', [commentId]);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getPosts,
  createPost,
  reviewPost,
  deletePost,
  toggleUpvote,
  toggleBookmark,
  getComments,
  addComment,
  deleteComment
};
