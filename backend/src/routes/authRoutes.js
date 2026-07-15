const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const validate = require("../middleware/validate");

const {
    registerSchema,
    loginSchema
} = require("../validators/authValidator");

/*
========================================
Authentication
========================================
*/

router.post(
    "/register",
    validate(registerSchema),
    authController.register
);

router.post(
    "/login",
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