const express = require("express");

const router = express.Router();

const controller = require("../controllers/linkController");

router.get("/:username/:alias", controller.redirect);

module.exports = router;