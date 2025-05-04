const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Public routes
router.post("/register", userController.register);
router.post("/login", userController.login);

// Token validation route
router.get("/validate-token", authMiddleware, userController.validateToken);

// Protected routes
router.get("/profile", authMiddleware, userController.getProfile);
router.put("/profile", authMiddleware, userController.updateProfile);
router.delete("/account", authMiddleware, userController.deleteAccount);

module.exports = router;
