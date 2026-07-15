const AppError = require("../utils/AppError");

const errorHandler = (err, req, res, next) => {
    // Already an AppError
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message
        });
    }

    /*
    ========================================
    Mongoose Duplicate Key Error
    ========================================
    */

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];

        return res.status(409).json({
            success: false,
            status: "fail",
            message: `${field} already exists.`
        });
    }

    /*
    ========================================
    Invalid Mongo ObjectId
    ========================================
    */

    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            status: "fail",
            message: "Invalid resource ID."
        });
    }

    /*
    ========================================
    JWT Errors
    ========================================
    */

    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            status: "fail",
            message: "Invalid token."
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            status: "fail",
            message: "Token expired."
        });
    }

    /*
    ========================================
    Validation Error
    ========================================
    */

    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            status: "fail",
            message: Object.values(err.errors)
                .map((e) => e.message)
                .join(", ")
        });
    }

    /*
    ========================================
    Unknown Error
    ========================================
    */

    console.error("========== SERVER ERROR ==========");
    console.error(err);
    console.error("==================================");

    return res.status(500).json({
        success: false,
        status: "error",
        message: "Internal Server Error"
    });
};

module.exports = errorHandler;