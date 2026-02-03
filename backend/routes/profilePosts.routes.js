const express = require('express');
const { authRequired, requireActiveUser } = require('../middleware/auth.middleware');
const {
  createPost,
  getAllPosts,
  getMyPosts,
  getPostById,
  updatePost,
  voteOnPost,
  getUserVote,
  deletePost,
  getPostStatusCounts,
} = require('../controllers/profilePosts.controller');

const router = express.Router();

/**
 * @route   GET /api/profile/posts/status-check
 * @desc    Get post status counts for debugging
 * @access  Public (no sensitive data exposed)
 */
router.get('/status-check', getPostStatusCounts);

/**
 * @route   GET /api/profile/posts/me
 * @desc    Get current user's posts (including pending)
 * @access  Protected (JWT required)
 * NOTE: This route MUST be defined before /:id to avoid matching 'me' as an ID
 */
router.get('/me', authRequired, getMyPosts);

/**
 * @route   GET /api/profile/posts
 * @desc    Get all profile posts (public - only approved)
 * @access  Public
 */
router.get('/', getAllPosts);

/**
 * @route   GET /api/profile/posts/:id
 * @desc    Get a single profile post by ID (public)
 * @access  Public
 */
router.get('/:id', getPostById);

/**
 * @route   POST /api/profile/posts
 * @desc    Create a new profile post
 * @access  Protected (JWT required, active user only)
 * @note    Blocked users cannot create posts
 */
router.post('/', authRequired, requireActiveUser, createPost);

/**
 * @route   PUT /api/profile/posts/:id
 * @desc    Update a profile post (owner only)
 * @access  Protected (JWT required, active user only)
 * @body    { place_name, state, content, rating, images? }
 * @note    Blocked users cannot update posts
 */
router.put('/:id', authRequired, requireActiveUser, updatePost);

/**
 * @route   POST /api/profile/posts/:id/vote
 * @desc    Vote on a profile post (upvote/downvote)
 * @access  Protected (JWT required, active user only)
 * @body    { type: "upvote" | "downvote" }
 * @note    Blocked users cannot vote
 */
router.post('/:id/vote', authRequired, requireActiveUser, voteOnPost);

/**
 * @route   GET /api/profile/posts/:id/vote
 * @desc    Get user's vote on a specific post
 * @access  Protected (JWT required)
 */
router.get('/:id/vote', authRequired, getUserVote);

/**
 * @route   DELETE /api/profile/posts/:id
 * @desc    Delete a profile post (owner only)
 * @access  Protected (JWT required)
 */
router.delete('/:id', authRequired, deletePost);

module.exports = router;

