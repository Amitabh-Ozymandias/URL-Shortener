const { z } = require("zod");

/*
========================================
Create Link
========================================
*/

const createLinkSchema = z.object({

    url: z
        .string()
        .trim()
        .url("Please provide a valid URL."),

    alias: z
        .string()
        .trim()
        .min(3, "Alias must be at least 3 characters.")
        .max(30, "Alias cannot exceed 30 characters.")
        .regex(
            /^[a-zA-Z0-9_-]+$/,
            "Alias can only contain letters, numbers, '_' and '-'."
        )

});

/*
========================================
Update Link
========================================
*/

const updateLinkSchema = z.object({

    alias: z
        .string()
        .trim()
        .min(3)
        .max(30)
        .regex(/^[a-zA-Z0-9_-]+$/)
        .optional(),

    active: z
        .boolean()
        .optional()

}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field must be provided."
    }
);

module.exports = {
    createLinkSchema,
    updateLinkSchema
};