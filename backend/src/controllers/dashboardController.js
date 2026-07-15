const dashboardService = require("../services/dashboardService");
const asyncHandler = require("../utils/asyncHandler");

const getDashboard = asyncHandler(async (req, res) => {
    const result = await dashboardService.getDashboard(req.user);

    res.status(200).json(result);
});

module.exports = {
    getDashboard
};