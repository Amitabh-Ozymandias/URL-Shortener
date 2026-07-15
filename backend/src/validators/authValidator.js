const { z } = require("zod");

/*
========================================
Register Schema
========================================
*/

const registerSchema = z.object({

    username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters.")
        .max(20, "Username cannot exceed 20 characters.")
        .regex(
            /^[a-zA-Z0-9_-]+$/,
            "Username can only contain letters, numbers, '_' and '-'."
        ),

    email: z
        .string()
        .trim()
        .email("Invalid email address."),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters.")
        .regex(/[A-Z]/, "Password must contain an uppercase letter.")
        .regex(/[a-z]/, "Password must contain a lowercase letter.")
        .regex(/[0-9]/, "Password must contain a number.")

});

/*
========================================
Login Schema
========================================
*/

const loginSchema = z.object({

    email: z
        .string()
        .trim()
        .email("Invalid email address."),

    password: z
        .string()
        .min(1, "Password is required.")

});

module.exports = {
    registerSchema,
    loginSchema
};