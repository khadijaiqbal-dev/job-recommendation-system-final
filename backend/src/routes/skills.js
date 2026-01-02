const express = require("express");
const router = express.Router();
const skillController = require("../controllers/skillController");
const { authenticateToken } = require("../middleware/auth");

// Get all skills (public or authenticated)
router.get("/", skillController.getSkills);

module.exports = router;
