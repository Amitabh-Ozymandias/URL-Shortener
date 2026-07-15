const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const linkRoutes = require("./routes/linkRoutes");
const publicRoutes = require("./routes/publicRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const errorHandler = require("./middleware/errorHandler");

const app = express();

/*
====================================
Middlewares
====================================
*/

app.use(helmet());

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

/*
====================================
Health
====================================
*/

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running"
    });
});

/*
====================================
API Routes
====================================
*/

app.use("/api/auth", authRoutes);

app.use("/api/links", linkRoutes);

app.use("/api/dashboard", dashboardRoutes);

/*
====================================
Public Redirect
====================================
*/

app.use("/", publicRoutes);

/*
====================================
404 Handler
====================================
*/

app.use((req, res, next) => {

    const AppError = require("./utils/AppError");

    next(new AppError("Route not found.", 404));

});

/*
====================================
Global Error Handler

ALWAYS LAST
====================================
*/

app.use(errorHandler);

module.exports = app;