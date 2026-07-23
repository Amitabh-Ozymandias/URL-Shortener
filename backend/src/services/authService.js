const bcrypt = require("bcrypt");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const AppError = require("../utils/AppError");
const cache = require("../utils/cacheService");

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

    // Parallelize duplicate lookup and password hashing to cut registration latency in half
    const [existingUser, hashedPassword] = await Promise.all([
        User.findOne({
            $or: [{ username }, { email }]
        }).lean(),
        bcrypt.hash(password, 10)
    ]);

    if (existingUser) {
        if (existingUser.username === username) {
            throw new AppError(
                "Username already taken.",
                409
            );
        }
        if (existingUser.email === email) {
            throw new AppError(
                "Email already exists.",
                409
            );
        }
    }

    const user = await User.create({
        username,
        email,
        password: hashedPassword
    });

    const token = generateToken(user._id);

    const userObj = {
        _id: user._id,
        username: user.username,
        email: user.email
    };

    // Pre-cache session for immediate token usage
    cache.set(`user:${user._id}`, userObj, 120);

    return {
        success: true,
        token,
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
    }).lean();

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

    const token = generateToken(user._id);

    const userObj = {
        _id: user._id,
        username: user.username,
        email: user.email
    };

    // Pre-cache user session in memory
    cache.set(`user:${user._id}`, userObj, 120);

    return {
        success: true,
        token,
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