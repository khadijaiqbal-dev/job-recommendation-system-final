const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// User routes - Get own applications
router.get("/user", authenticateToken, applicationController.getUserApplications);
router.get("/:id", authenticateToken, applicationController.getApplicationById);
router.get("/:id/history", authenticateToken, applicationController.getApplicationStatusHistory);

// Admin routes - Manage all applications
router.get("/admin/all", authenticateToken, requireAdmin, applicationController.getAllApplications);
router.put("/:id/status", authenticateToken, requireAdmin, applicationController.updateApplicationStatus);

module.exports = router;
