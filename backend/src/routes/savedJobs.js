const express = require('express');
const router = express.Router();
const savedJobsController = require('../controllers/savedJobsController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all saved jobs
router.get('/', savedJobsController.getSavedJobs);

// Get saved job IDs (for quick checking)
router.get('/ids', savedJobsController.getSavedJobIds);

// Check if a specific job is saved
router.get('/:jobId/check', savedJobsController.isJobSaved);

// Save a job
router.post('/:jobId', savedJobsController.saveJob);

// Update saved job notes
router.put('/:jobId', savedJobsController.updateSavedJobNotes);

// Remove a saved job
router.delete('/:jobId', savedJobsController.unsaveJob);

module.exports = router;
