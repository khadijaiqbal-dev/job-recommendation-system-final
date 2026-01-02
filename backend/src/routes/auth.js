const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { validateRegistration, validateLogin } = require("../middleware/validation");
const { authenticateToken } = require("../middleware/auth");

// Public routes
router.post("/register", validateRegistration, authController.register);
router.post("/login", validateLogin, authController.login);
router.post("/verify", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerificationCode);
router.post("/request-password-reset", authController.requestPasswordReset);
router.post("/reset-password", authController.resetPassword);

// Protected routes
router.get("/profile", authenticateToken, authController.getProfile);

module.exports = router;
