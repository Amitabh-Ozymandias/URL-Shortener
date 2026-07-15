const linkService = require("../services/linkService");

const asyncHandler = require("../utils/asyncHandler");

/*
========================================
Create Link
========================================
*/

const createLink = asyncHandler(async (req, res) => {

    const result = await linkService.createLink(
        req.user,
        req.body
    );

    res.status(201).json(result);

});

/*
========================================
Get User Links
========================================
*/

const getLinks = asyncHandler(async (req, res) => {

    const result =
        await linkService.getLinks(
            req.user,
            req.query
        );

    res.status(200).json(result);

});

/*
========================================
Update Link
========================================
*/

const updateLink = asyncHandler(async (req, res) => {

    const result = await linkService.updateLink(
        req.user,
        req.params.id,
        req.body
    );

    res.status(200).json(result);

});

/*
========================================
Delete Link
========================================
*/

const deleteLink = asyncHandler(async (req, res) => {

    const result = await linkService.deleteLink(
        req.user,
        req.params.id
    );

    res.status(200).json(result);

});

/*
========================================
Redirect
========================================
*/

const redirect = asyncHandler(async (req, res) => {

    const originalUrl = await linkService.redirectLink(
        req.params.username,
        req.params.alias,
        req.ip,
        req.headers["user-agent"]
    );

    return res.redirect(originalUrl);

});

module.exports = {
    createLink,
    getLinks,
    updateLink,
    deleteLink,
    redirect
};