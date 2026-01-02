const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
// Public routes - Anyone can view jobs
router.get("/", jobController.getJobs);
router.get("/admin", authenticateToken, requireAdmin, jobController.getJobsForAdmin);
router.get("/recommendations", authenticateToken, jobController.getJobRecommendations);
router.get("/:id", jobController.getJobById);
// Protected routes - Only authenticated users can apply
router.post("/:id/apply", authenticateToken, jobController.applyToJob);
// Admin-only routes - Only admins can manage jobs
router.post("/", authenticateToken, requireAdmin, jobController.createJob);
router.put("/:id", authenticateToken, requireAdmin, jobController.updateJob);
router.delete("/:id", authenticateToken, requireAdmin, jobController.deleteJob);

module.exports = router;
