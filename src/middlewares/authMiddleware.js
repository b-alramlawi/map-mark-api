// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const {apiResponse} = require('../helpers/apiResponse');

module.exports = {
    // Middleware to verify user authentication
    isAuthenticated: (req, res, next) => {
        // Check if a valid token is present in the request headers
        const token = req.headers['authorization'];

        if (!token) {
            return apiResponse(res, 401, 'error', 'Unauthorized: Token missing', null, null);
        }

        // Verify the token
        jwt.verify(token, config.secretKey, (err, decoded) => {
            if (err) {
                return apiResponse(res, 401, 'error', 'Unauthorized: Invalid token', null, null);
            }

            // Attach the user ID or other user information to the request for further processing
            req.userId = decoded.userId;
            next();
        });
    },
};
