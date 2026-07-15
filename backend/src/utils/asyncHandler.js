/**
 * Wraps an async controller and forwards any rejected promise
 * to Express' global error handler.
 */

const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = asyncHandler;