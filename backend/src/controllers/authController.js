const authService = require("../services/authService");

const asyncHandler = require("../utils/asyncHandler");

/*
========================================
Register User
========================================
*/

const register = asyncHandler(async (req, res) => {

    const result = await authService.registerUser(req.body);

    res.status(201).json(result);

});

/*
========================================
Login User
========================================
*/

const login = asyncHandler(async (req, res) => {

    const result = await authService.loginUser(req.body);

    res.status(200).json(result);

});

/*
========================================
Current User
========================================
*/

const me = asyncHandler(async (req, res) => {

    res.status(200).json({

        success: true,

        user: req.user

    });

});

module.exports = {
    register,
    login,
    me
};