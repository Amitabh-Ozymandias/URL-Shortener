const Link = require("../models/Link");

const getDashboard = async (user) => {
    const now = new Date();

    const dashboard = await Link.aggregate([
        {
            $match: {
                owner: user._id
            }
        },

        {
            $facet: {
                totalLinks: [
                    {
                        $count: "count"
                    }
                ],

                activeLinks: [
                    {
                        $match: {
                            active: true,
                            expiresAt: {
                                $gt: now
                            },
                            $expr: {
                                $lt: [
                                    "$clicks",
                                    "$maxClicks"
                                ]
                            }
                        }
                    },
                    {
                        $count: "count"
                    }
                ],

                expiredLinks: [
    {
        $match: {
            active: true,
            expiresAt: { $lt: now }
        }
    },
    {
        $count: "count"
    }
],

                disabledLinks: [
                    {
                        $match: {
                            active: false
                        }
                    },
                    {
                        $count: "count"
                    }
                ],

                clickLimitReached: [
                    {
                        $match: {
                            active: true,
                            expiresAt: {
                                $gt: now
                            },
                            $expr: {
                                $gte: [
                                    "$clicks",
                                    "$maxClicks"
                                ]
                            }
                        }
                    },
                    {
                        $count: "count"
                    }
                ],

                totalClicks: [
                    {
                        $group: {
                            _id: null,
                            clicks: {
                                $sum: "$clicks"
                            }
                        }
                    }
                ],

                remainingClicks: [
    {
        $group: {
            _id: null,
            remaining: {
                $sum: {
                    $cond: [
                        {
                            $gt: [
                                {
                                    $subtract: [
                                        "$maxClicks",
                                        "$clicks"
                                    ]
                                },
                                0
                            ]
                        },
                        {
                            $subtract: [
                                "$maxClicks",
                                "$clicks"
                            ]
                        },
                        0
                    ]
                }
            }
        }
    }
],

                mostClicked: [
                    {
                        $sort: {
                            clicks: -1
                        }
                    },
                    {
                        $limit: 1
                    },
                    {
                        $project: {
                            _id: 1,
                            alias: 1,
                            slug: 1,
                            clicks: 1,
                            originalUrl: 1
                        }
                    }
                ],

                recentLinks: [
                    {
                        $sort: {
                            createdAt: -1
                        }
                    },
                    {
                        $limit: 5
                    },
                    {
                        $project: {
                            _id: 1,
                            alias: 1,
                            slug: 1,
                            clicks: 1,
                            active: 1,
                            expiresAt: 1,
                            createdAt: 1
                        }
                    }
                ]
            }
        }
    ]);

    const result = dashboard[0];

    return {
        success: true,

        stats: {

            totalLinks:
                result.totalLinks[0]?.count || 0,

            activeLinks:
                result.activeLinks[0]?.count || 0,

            expiredLinks:
                result.expiredLinks[0]?.count || 0,

            disabledLinks:
                result.disabledLinks[0]?.count || 0,

            clickLimitReached:
                result.clickLimitReached[0]?.count || 0,

            totalClicks:
                result.totalClicks[0]?.clicks || 0,

            remainingClicks:
                result.remainingClicks[0]?.remaining || 0

        },

        mostClicked:
            result.mostClicked[0] || null,

        recentLinks:
            result.recentLinks
    };
};

module.exports = {
    getDashboard
};