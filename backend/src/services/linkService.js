const Link = require("../models/Link");
const AppError = require("../utils/AppError");
const { getExpiryDate } = require("../utils/date");
const APIFeatures = require("../utils/APIFeatures");

const createLink = async (user, data) => {
    const alias = data.alias.trim().toLowerCase();

    const existing = await Link.findOne({
        owner: user._id,
        alias,
        active: true
    });

    if (existing) {
        throw new AppError("Alias already exists.", 409);
    }

    const slug = `${user.username}/${alias}`;

    const link = await Link.create({
        owner: user._id,
        username: user.username,
        alias,
        slug,
        originalUrl: data.url,
        expiresAt: getExpiryDate()
    });

    return {
        success: true,
        link: {
            id: link._id,
            alias: link.alias,
            slug: link.slug,
            originalUrl: link.originalUrl,
            clicks: link.clicks,
            remainingClicks: link.maxClicks - link.clicks,
            expiresAt: link.expiresAt,
            shortUrl: `${process.env.BASE_URL}/${link.slug}`
        }
    };
};

const getLinks = async (user, queryParams) => {

    const mongoQuery = {
        owner: user._id,
        active: true
    };

    if (queryParams.search) {

        mongoQuery.$or = [

            {
                alias: {
                    $regex: queryParams.search,
                    $options: "i"
                }
            },

            {
                originalUrl: {
                    $regex: queryParams.search,
                    $options: "i"
                }
            }

        ];

    }

    if (queryParams.status) {

        delete mongoQuery.active;

        switch (queryParams.status.toLowerCase()) {

            case "active":

                mongoQuery.active = true;

                mongoQuery.expiresAt = {
                    $gt: new Date()
                };

                mongoQuery.$expr = {
                    $lt: [
                        "$clicks",
                        "$maxClicks"
                    ]
                };

                break;

            case "expired":

                mongoQuery.active = true;

                mongoQuery.expiresAt = {
                    $lt: new Date()
                };

                break;

            case "disabled":

                mongoQuery.active = false;

                break;

            case "clicklimit":

                mongoQuery.active = true;

                mongoQuery.expiresAt = {
                    $gt: new Date()
                };

                mongoQuery.$expr = {
                    $gte: [
                        "$clicks",
                        "$maxClicks"
                    ]
                };

                break;

        }

    }

    const totalLinks =
        await Link.countDocuments(mongoQuery);

    const features =
        new APIFeatures(

            Link.find(mongoQuery),

            queryParams

        )

            .sort()

            .paginate();

    const links =
        await features.query;

    return {

        success: true,

        page: features.page,

        limit: features.limit,

        totalLinks,

        totalPages: Math.max(
            1,
            Math.ceil(totalLinks / features.limit)
        ),

        links

    };

};

const updateLink = async (
    user,
    id,
    body
) => {

    const link = await Link.findOne({

        _id: id,

        owner: user._id,

        active: true

    });

    if (!link) {
        throw new AppError(
            "Link not found.",
            404
        );
    }

    if (body.alias) {

        const alias = body.alias.trim().toLowerCase();

        const duplicate =
            await Link.findOne({

                owner: user._id,

                alias,

                active: true,

                _id: { $ne: id }

            });

        if (duplicate) {

            throw new AppError(
                "Alias already exists.",
                409
            );

        }

        link.alias = alias;

        link.slug =
            `${user.username}/${alias}`;

    }

    if (typeof body.active === "boolean") {

        link.active = body.active;

    }

    await link.save();

    return {

        success: true,

        link

    };

};

const deleteLink = async (user, id) => {
    const link = await Link.findOne({
        _id: id,
        owner: user._id
    });

    if (!link) {
        throw new AppError("Link not found.", 404);
    }

    link.active = false;

    await link.save();

    return {
        success: true,
        message: "Link disabled successfully."
    };
};

const redirectLink = async (

    username,

    alias,

    ip,

    userAgent

) => {

    const slug =
        `${username.toLowerCase()}/${alias.toLowerCase()}`;

    const link =
        await Link.findOne({

            slug

        });

    if (!link) {

        throw new AppError(
            "Link not found.",
            404
        );

    }

    if (!link.active) {

        throw new AppError(
            "This link has been disabled.",
            403
        );

    }

    if (new Date() > link.expiresAt) {

        throw new AppError(
            "This link has expired.",
            410
        );

    }

    if (link.clicks >= link.maxClicks) {

        throw new AppError(
            "Maximum clicks reached.",
            410
        );

    }

    await Link.findByIdAndUpdate(
        link._id,
        {
            $inc: {
                clicks: 1
            },
            $push: {
                visits: {
                    timestamp: new Date(),
                    ip,
                    userAgent
                }
            }
        },
        {
            new: true
        }
    );

    return link.originalUrl;

};

module.exports = {

    createLink,

    getLinks,

    updateLink,

    deleteLink,

    redirectLink

};