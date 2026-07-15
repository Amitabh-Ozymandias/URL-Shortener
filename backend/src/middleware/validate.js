const validate = (schema) => {
    return (req, res, next) => {

        const result = schema.safeParse(req.body);

        if (!result.success) {

            const errors = result.error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message
            }));

            return res.status(400).json({
                success: false,
                status: "fail",
                errors
            });

        }

        // Replace body with parsed data
        req.body = result.data;

        next();
    };
};

module.exports = validate;