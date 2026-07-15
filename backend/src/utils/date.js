const { DEFAULT_EXPIRY_DAYS } = require("./constants");

const getExpiryDate = () => {
    const expiry = new Date();

    expiry.setDate(expiry.getDate() + DEFAULT_EXPIRY_DAYS);

    return expiry;
};

module.exports = {
    getExpiryDate
};