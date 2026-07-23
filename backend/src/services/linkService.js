const Link = require("../models/Link");
const AppError = require("../utils/AppError");
const { getExpiryDate } = require("../utils/date");
const APIFeatures = require("../utils/APIFeatures");
const cache = require("../utils/cacheService");
const analyticsQueue = require("../utils/analyticsQueue");

/**
 * Create a new short link
 */
const createLink = async (user, data) => {
    const alias = data.alias.trim().toLowerCase();

    const existing = await Link.findOne({
        owner: user._id,
        alias,
        active: true
    }).lean();

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

    const linkObject = {
        _id: link._id,
        id: link._id,
        owner: link.owner,
        username: link.username,
        alias: link.alias,
        slug: link.slug,
        originalUrl: link.originalUrl,
        clicks: link.clicks,
        maxClicks: link.maxClicks,
        expiresAt: link.expiresAt,
        active: link.active
    };

    // Pre-cache slug redirect for sub-millisecond first hit
    cache.set(`slug:${slug}`, linkObject, 300);

    // Invalidate user dashboard cache
    cache.delPattern(`dash:${user._id}`);

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

/**
 * Fetch links with search, filter, sorting, and pagination using lean queries
 */
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
                mongoQuery.expiresAt = { $gt: new Date() };
                mongoQuery.$expr = { $lt: ["$clicks", "$maxClicks"] };
                break;

            case "expired":
                mongoQuery.active = true;
                mongoQuery.expiresAt = { $lt: new Date() };
                break;

            case "disabled":
                mongoQuery.active = false;
                break;

            case "clicklimit":
                mongoQuery.active = true;
                mongoQuery.expiresAt = { $gt: new Date() };
                mongoQuery.$expr = { $gte: ["$clicks", "$maxClicks"] };
                break;
        }
    }

    const totalLinks = await Link.countDocuments(mongoQuery);

    const features = new APIFeatures(Link.find(mongoQuery).lean(), queryParams)
        .sort()
        .paginate();

    const links = await features.query;

    return {
        success: true,
        page: features.page,
        limit: features.limit,
        totalLinks,
        totalPages: Math.max(1, Math.ceil(totalLinks / features.limit)),
        links
    };
};

/**
 * Update link alias or status
 */
const updateLink = async (user, id, body) => {
    const link = await Link.findOne({
        _id: id,
        owner: user._id,
        active: true
    });

    if (!link) {
        throw new AppError("Link not found.", 404);
    }

    const oldSlug = link.slug;

    if (body.alias) {
        const alias = body.alias.trim().toLowerCase();

        const duplicate = await Link.findOne({
            owner: user._id,
            alias,
            active: true,
            _id: { $ne: id }
        }).lean();

        if (duplicate) {
            throw new AppError("Alias already exists.", 409);
        }

        link.alias = alias;
        link.slug = `${user.username}/${alias}`;
    }

    if (typeof body.active === "boolean") {
        link.active = body.active;
    }

    await link.save();

    // Evict old and new cache entries
    cache.del(`slug:${oldSlug}`);
    cache.del(`slug:${link.slug}`);
    cache.delPattern(`dash:${user._id}`);

    return {
        success: true,
        link
    };
};

/**
 * Soft delete (disable) a short link
 */
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

    // Evict cache entries
    cache.del(`slug:${link.slug}`);
    cache.delPattern(`dash:${user._id}`);

    return {
        success: true,
        message: "Link disabled successfully."
    };
};

/**
 * Fast Sub-Millisecond Redirect with In-Memory Caching & Non-Blocking Analytics Queue
 */
const redirectLink = async (username, alias, ip, userAgent) => {
    const slug = `${username.toLowerCase()}/${alias.toLowerCase()}`;
    const cacheKey = `slug:${slug}`;

    let link = cache.get(cacheKey);

    if (!link) {
        link = await Link.findOne({ slug }).lean();

        if (!link) {
            throw new AppError("Link not found.", 404);
        }

        // Cache resolution object in-memory for 5 minutes
        cache.set(cacheKey, link, 300);
    }

    if (!link.active) {
        throw new AppError("This link has been disabled.", 403);
    }

    if (new Date() > new Date(link.expiresAt)) {
        cache.del(cacheKey);
        throw new AppError("This link has expired.", 410);
    }

    if (link.clicks >= link.maxClicks) {
        cache.del(cacheKey);
        throw new AppError("Maximum clicks reached.", 410);
    }

    // Increment cached clicks count locally
    link.clicks += 1;

    // Offload analytics DB write to non-blocking background queue
    analyticsQueue.enqueue(link._id, {
        timestamp: new Date(),
        ip,
        userAgent
    });

    return link.originalUrl;
};

module.exports = {
    createLink,
    getLinks,
    updateLink,
    deleteLink,
    redirectLink
};