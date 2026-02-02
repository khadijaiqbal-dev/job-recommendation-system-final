const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get AI-powered job recommendations
router.get('/', recommendationController.getAIRecommendations);

// Get similar jobs to a specific job
router.get('/similar/:jobId', recommendationController.getSimilarJobs);

// Get user's learned interests (for debugging/profile)
router.get('/interests', recommendationController.getUserInterests);

module.exports = router;
