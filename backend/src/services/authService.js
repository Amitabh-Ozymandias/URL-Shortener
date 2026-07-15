const bcrypt = require("bcrypt");

const User = require("../models/User");

const generateToken = require("../utils/generateToken");

const AppError = require("../utils/AppError");

/*
========================================
Register User
========================================
*/

const registerUser = async ({ username, email, password }) => {

    if (!username || !email || !password) {
        throw new AppError(
            "Username, email and password are required.",
            400
        );
    }

    username = username.trim().toLowerCase();
    email = email.trim().toLowerCase();

    const existingUsername = await User.findOne({
        username
    });

    if (existingUsername) {
        throw new AppError(
            "Username already taken.",
            409
        );
    }

    const existingEmail = await User.findOne({
        email
    });

    if (existingEmail) {
        throw new AppError(
            "Email already exists.",
            409
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        email,
        password: hashedPassword
    });

    return {
        success: true,

        token: generateToken(user._id),

        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    };
};

/*
========================================
Login User
========================================
*/

const loginUser = async ({ email, password }) => {

    if (!email || !password) {
        throw new AppError(
            "Email and password are required.",
            400
        );
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({
        email
    });

    if (!user) {
        throw new AppError(
            "Invalid credentials.",
            401
        );
    }

    const validPassword = await bcrypt.compare(
        password,
        user.password
    );

    if (!validPassword) {
        throw new AppError(
            "Invalid credentials.",
            401
        );
    }

    return {
        success: true,

        token: generateToken(user._id),

        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    };
};

module.exports = {
    registerUser,
    loginUser
};