const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const validate = require("../middleware/validate");

const linkController = require("../controllers/linkController");

const {
    createLinkSchema,
    updateLinkSchema
} = require("../validators/linkValidator");

/*
========================================
Protected Routes
========================================
*/

// Create Link
router.post(
    "/",
    protect,
    validate(createLinkSchema),
    linkController.createLink
);

// Get All Links
router.get(
    "/",
    protect,
    linkController.getLinks
);

// Update Link
router.patch(
    "/:id",
    protect,
    validate(updateLinkSchema),
    linkController.updateLink
);

// Delete Link
router.delete(
    "/:id",
    protect,
    linkController.deleteLink
);

module.exports = router;