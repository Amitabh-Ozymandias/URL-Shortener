const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");

const {
    registerSchema,
    loginSchema
} = require("../validators/authValidator");

/*
========================================
Authentication Routes with Rate Limiting
========================================
*/

router.post(
    "/register",
    authLimiter,
    validate(registerSchema),
    authController.register
);

router.post(
    "/login",
    authLimiter,
    validate(loginSchema),
    authController.login
);

/*
========================================
Current User
========================================
*/

router.get(
    "/me",
    protect,
    authController.me
);

module.exports = router;