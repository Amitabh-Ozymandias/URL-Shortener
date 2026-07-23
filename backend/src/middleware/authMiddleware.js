const jwt = require("jsonwebtoken");
const User = require("../models/User");
const cache = require("../utils/cacheService");

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const cacheKey = `user:${decoded.id}`;
        let user = cache.get(cacheKey);

        if (!user) {
            user = await User.findById(decoded.id).select("-password").lean();

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Cache user session for 2 minutes to eliminate repeated DB queries across endpoints
            cache.set(cacheKey, user, 120);
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = protect;