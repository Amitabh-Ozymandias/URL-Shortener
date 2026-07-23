const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
    {
        timestamp: {
            type: Date,
            default: Date.now
        },

        ip: {
            type: String,
            default: "Unknown"
        },

        userAgent: {
            type: String,
            default: "Unknown"
        }
    },
    {
        _id: false
    }
);

const linkSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        username: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        alias: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            minlength: 3,
            maxlength: 30
        },

        slug: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        originalUrl: {
            type: String,
            required: true,
            trim: true
        },

        clicks: {
            type: Number,
            default: 0
        },

        maxClicks: {
            type: Number,
            default: 10
        },

        expiresAt: {
            type: Date,
            required: true
        },

        active: {
            type: Boolean,
            default: true
        },

        visits: {
            type: [visitSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

/*
------------------------------------
Indexes
------------------------------------
*/

// One alias per user
linkSchema.index(
    {
        owner: 1,
        alias: 1
    },
    {
        unique: true
    }
);

// Fast redirect lookup
linkSchema.index(
    {
        slug: 1
    },
    {
        unique: true
    }
);

// Fast user link filtering & pagination
linkSchema.index({
    owner: 1,
    active: 1,
    expiresAt: 1,
    createdAt: -1
});

// Fast dashboard top clicked links lookup
linkSchema.index({
    owner: 1,
    clicks: -1
});

module.exports = mongoose.model("Link", linkSchema);