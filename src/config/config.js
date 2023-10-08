// config/config.js
require('dotenv').config();

// config.js
const baseUrl = process.env.BASE_URL
const secretKey = process.env.SECRET_KEY
const databaseUrl = process.env.MONGODB_URI
const port = process.env.PORT || 3000;

module.exports = {
    baseUrl, secretKey, databaseUrl, port
};
