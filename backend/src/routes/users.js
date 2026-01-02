const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateProfile } = require('../middleware/validation');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Protected routes - Any authenticated user can manage their own profile
router.get('/profile', authenticateToken, userController.getUserProfile);
router.put('/profile', authenticateToken, validateProfile, userController.updateProfile);

// Admin-only routes - Only admins can view all users and send verification emails
router.get('/', authenticateToken, requireAdmin, userController.getAllUsers);
router.post('/:userId/send-verification', authenticateToken, requireAdmin, userController.sendManualVerificationEmail);

module.exports = router;
