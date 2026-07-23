const express = require("express");
const router = express.Router();
const controller = require("../controllers/linkController");
const { redirectLimiter } = require("../middleware/rateLimiter");

router.get("/:username/:alias", redirectLimiter, controller.redirect);

module.exports = router;