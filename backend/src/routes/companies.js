const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes - Anyone can view companies
router.get('/', companyController.getCompanies);
router.get('/:id', companyController.getCompanyById);

// Admin-only routes - Only admins can manage companies
router.post('/', authenticateToken, requireAdmin, companyController.createCompany);
router.put('/:id', authenticateToken, requireAdmin, companyController.updateCompany);
router.delete('/:id', authenticateToken, requireAdmin, companyController.deleteCompany);

module.exports = router;
