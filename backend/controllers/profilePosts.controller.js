const { connectToDatabase } = require('../utils/db');

/**
 * Validation helper - checks if value is non-empty string
 */
function isValidString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validation helper - checks if rating is valid (1-5)
 */
function isValidRating(value) {
  const rating = parseInt(value, 10);
  return !isNaN(rating) && rating >= 1 && rating <= 5;
}

/**
 * Create a new profile post
 * POST /api/profile/posts
 */
async function createPost(req, res) {
  try {
    const { place_name, state, content, rating, images } = req.body;
    const userId = req.user.id;

    // Validate required fields
    const errors = [];

    if (!isValidString(place_name)) {
      errors.push('place_name is required and must be a non-empty string');
    }

    if (!isValidString(state)) {
      errors.push('state is required and must be a non-empty string');
    }

    if (!isValidString(content)) {
      errors.push('content is required and must be a non-empty string');
    }

    if (!isValidRating(rating)) {
      errors.push('rating is required and must be between 1 and 5');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        messages: errors,
      });
    }

    const connection = await connectToDatabase();

    // Insert the post
    const [result] = await connection.execute(
      `INSERT INTO profile_posts (user_id, place_name, state, content, rating, images) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        place_name.trim(),
        state.trim(),
        content.trim(),
        parseInt(rating, 10),
        images ? JSON.stringify(images) : null,
      ]
    );

    // Fetch the created post with user info
    const [posts] = await connection.execute(
      `SELECT 
        pp.*,
        u.name as user_name,
        u.email as user_email,
        u.avatar as user_avatar
      FROM profile_posts pp
      JOIN users u ON pp.user_id = u.id
      WHERE pp.id = ?`,
      [result.insertId]
    );

    const post = {
      ...posts[0],
      images: posts[0].images ? JSON.parse(posts[0].images) : [],
    };

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post,
    });
  } catch (err) {
    console.error('Error creating profile post:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create post',
    });
  }
}

/**
 * Get all profile posts (only approved ones for public viewing)
 * GET /api/profile/posts
 */
async function getAllPosts(req, res) {
  try {
    const connection = await connectToDatabase();

    // Only fetch approved posts for public display
    const [posts] = await connection.execute(`
      SELECT 
        pp.*,
        u.name as user_name,
        u.email as user_email,
        u.avatar as user_avatar
      FROM profile_posts pp
      JOIN users u ON pp.user_id = u.id
      WHERE pp.status = 'approved'
      ORDER BY pp.created_at DESC
    `);

    // Parse images JSON for each post
    const formattedPosts = posts.map((post) => ({
      ...post,
      images: post.images ? JSON.parse(post.images) : [],
    }));

    res.json({
      success: true,
      posts: formattedPosts,
      count: formattedPosts.length,
    });
  } catch (err) {
    console.error('Error fetching profile posts:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch posts',
    });
  }
}

/**
 * Get a single profile post by ID
 * GET /api/profile/posts/:id
 */
async function getPostById(req, res) {
  try {
    const { id } = req.params;
    const connection = await connectToDatabase();

    const [posts] = await connection.execute(
      `SELECT 
        pp.*,
        u.name as user_name,
        u.email as user_email,
        u.avatar as user_avatar
      FROM profile_posts pp
      JOIN users u ON pp.user_id = u.id
      WHERE pp.id = ?`,
      [id]
    );

    if (posts.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Post not found',
      });
    }

    const post = {
      ...posts[0],
      images: posts[0].images ? JSON.parse(posts[0].images) : [],
    };

    res.json({
      success: true,
      post,
    });
  } catch (err) {
    console.error('Error fetching profile post:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch post',
    });
  }
}

/**
 * Vote on a profile post (upvote or downvote)
 * POST /api/profile/posts/:id/vote
 */
async function voteOnPost(req, res) {
  try {
    const { id } = req.params;
    const { type } = req.body;
    const userId = req.user.id;

    // Validate vote type
    if (!type || !['upvote', 'downvote'].includes(type)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'type must be either "upvote" or "downvote"',
      });
    }

    const connection = await connectToDatabase();

    // Check if post exists
    const [posts] = await connection.execute(
      'SELECT id, upvotes, downvotes FROM profile_posts WHERE id = ?',
      [id]
    );

    if (posts.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Post not found',
      });
    }

    const post = posts[0];

    // Check if user already voted
    const [existingVotes] = await connection.execute(
      'SELECT id, vote_type FROM profile_post_votes WHERE post_id = ? AND user_id = ?',
      [id, userId]
    );

    let message = '';
    let newUpvotes = post.upvotes;
    let newDownvotes = post.downvotes;
    let userVote = null;

    if (existingVotes.length > 0) {
      const existingVote = existingVotes[0];

      if (existingVote.vote_type === type) {
        // Same vote - remove it (toggle off)
        await connection.execute(
          'DELETE FROM profile_post_votes WHERE post_id = ? AND user_id = ?',
          [id, userId]
        );

        if (type === 'upvote') {
          newUpvotes = Math.max(0, newUpvotes - 1);
        } else {
          newDownvotes = Math.max(0, newDownvotes - 1);
        }

        message = 'Vote removed';
        userVote = null;
      } else {
        // Different vote - update it (use ON DUPLICATE KEY to handle race condition)
        await connection.execute(
          `INSERT INTO profile_post_votes (post_id, user_id, vote_type) 
           VALUES (?, ?, ?) 
           ON DUPLICATE KEY UPDATE vote_type = VALUES(vote_type)`,
          [id, userId, type]
        );

        if (type === 'upvote') {
          newUpvotes += 1;
          newDownvotes = Math.max(0, newDownvotes - 1);
        } else {
          newDownvotes += 1;
          newUpvotes = Math.max(0, newUpvotes - 1);
        }

        message = 'Vote changed';
        userVote = type;
      }
    } else {
      // New vote - use INSERT ON DUPLICATE KEY to handle race condition
      const [result] = await connection.execute(
        `INSERT INTO profile_post_votes (post_id, user_id, vote_type) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE vote_type = VALUES(vote_type)`,
        [id, userId, type]
      );

      // affectedRows = 1 means new insert, 2 means update happened (race condition handled)
      if (result.affectedRows === 2) {
        // A vote already existed (race condition) - re-fetch to get accurate counts
        const [currentVotes] = await connection.execute(
          'SELECT vote_type FROM profile_post_votes WHERE post_id = ? AND user_id = ?',
          [id, userId]
        );
        userVote = currentVotes.length > 0 ? currentVotes[0].vote_type : null;
        message = 'Vote updated';
      } else {
        if (type === 'upvote') {
          newUpvotes += 1;
        } else {
          newDownvotes += 1;
        }
        message = 'Vote recorded';
        userVote = type;
      }
    }

    // Update post vote counts
    await connection.execute(
      'UPDATE profile_posts SET upvotes = ?, downvotes = ? WHERE id = ?',
      [newUpvotes, newDownvotes, id]
    );

    res.json({
      success: true,
      message,
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      userVote,
    });
  } catch (err) {
    console.error('Error voting on profile post:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to vote on post',
    });
  }
}

/**
 * Get user's vote on a specific post
 * GET /api/profile/posts/:id/vote
 */
async function getUserVote(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const connection = await connectToDatabase();

    const [votes] = await connection.execute(
      'SELECT vote_type FROM profile_post_votes WHERE post_id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({
      success: true,
      userVote: votes.length > 0 ? votes[0].vote_type : null,
    });
  } catch (err) {
    console.error('Error fetching user vote:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch vote',
    });
  }
}

/**
 * Update a profile post (only owner can edit)
 * PUT /api/profile/posts/:id
 */
async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { place_name, state, content, rating, images } = req.body;
    const userId = req.user.id;

    // Validate required fields
    const errors = [];

    if (!isValidString(place_name)) {
      errors.push('place_name is required and must be a non-empty string');
    }

    if (!isValidString(state)) {
      errors.push('state is required and must be a non-empty string');
    }

    if (!isValidString(content)) {
      errors.push('content is required and must be a non-empty string');
    }

    if (!isValidRating(rating)) {
      errors.push('rating is required and must be between 1 and 5');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        messages: errors,
      });
    }

    const connection = await connectToDatabase();

    // Check if post exists
    const [posts] = await connection.execute(
      'SELECT id, user_id FROM profile_posts WHERE id = ?',
      [id]
    );

    if (posts.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Post not found',
      });
    }

    // Check ownership (use == to handle string/number type mismatch)
    if (String(posts[0].user_id) !== String(userId)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not authorized to edit this post',
      });
    }

    // Update the post
    await connection.execute(
      `UPDATE profile_posts 
       SET place_name = ?, state = ?, content = ?, rating = ?, images = ?
       WHERE id = ?`,
      [
        place_name.trim(),
        state.trim(),
        content.trim(),
        parseInt(rating, 10),
        images ? JSON.stringify(images) : null,
        id,
      ]
    );

    // Fetch the updated post with user info
    const [updatedPosts] = await connection.execute(
      `SELECT 
        pp.*,
        u.name as user_name,
        u.email as user_email,
        u.avatar as user_avatar
      FROM profile_posts pp
      JOIN users u ON pp.user_id = u.id
      WHERE pp.id = ?`,
      [id]
    );

    const post = {
      ...updatedPosts[0],
      images: updatedPosts[0].images ? JSON.parse(updatedPosts[0].images) : [],
    };

    res.json({
      success: true,
      message: 'Post updated successfully',
      post,
    });
  } catch (err) {
    console.error('Error updating profile post:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update post',
      details: err.message,
    });
  }
}

/**
 * Delete a profile post (only owner can delete)
 * DELETE /api/profile/posts/:id
 */
async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const connection = await connectToDatabase();

    // Check if post exists and belongs to user
    const [posts] = await connection.execute(
      'SELECT id, user_id FROM profile_posts WHERE id = ?',
      [id]
    );

    if (posts.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Post not found',
      });
    }

    // Check ownership (use String() to handle type mismatch)
    if (String(posts[0].user_id) !== String(userId)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not authorized to delete this post',
      });
    }

    await connection.execute('DELETE FROM profile_posts WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting profile post:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete post',
    });
  }
}

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  voteOnPost,
  getUserVote,
  deletePost,
};

