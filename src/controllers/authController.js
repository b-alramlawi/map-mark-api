// authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const {sendEmail} = require('../helpers/mailSender');
const {registrationSchema, loginSchema} = require('../validators/authValidator');
const {apiResponse} = require('../helpers/apiResponse');


async function signupUser(req, res) {
    try {
        const {email, password, username} = req.body;

        // Validate the request data against the registration schema
        const {error} = registrationSchema.validate({email, password, username});

        if (error) {
            const errorMessage = 'Validation error. Please check your data and try again.';
            console.error(errorMessage);
            return apiResponse(res, 400, 'error', errorMessage, null, null);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with isVerified set to false
        const newUser = new User({
            email,
            password: hashedPassword,
            username,
            isVerified: false, // Initial email verification status
        });

        // Attempt to save the user to the database
        try {
            await newUser.save();
        } catch (dbError) {
            if (dbError.code === 11000 && dbError.keyPattern.email === 1) {
                const errorMessage = 'Email address already exists. Please use a different email.';
                console.error(errorMessage);
                return apiResponse(res, 409, 'error', errorMessage, null, null);
            } else {
                // Handle other database errors here, if needed
                const errorMessage = 'Database error. Please try again later.';
                console.error(errorMessage);
                return apiResponse(res, 500, 'error', errorMessage, null, null);
            }
        }

        // Send a verification email
        const verificationToken = jwt.sign({email}, config.secretKey, {expiresIn: '1d'});

        // Construct the verification link with the frontend route
        const verificationLink = `http://localhost:3001/v-success?token=${verificationToken}`;

        const subject = 'Email Verification';
        const html = `Click the following link to verify your email: <a href="${verificationLink}">Verify Your Email</a>`;

        await sendEmail(email, subject, html);

        // Use apiResponse to send a success response
        return apiResponse(res, 201, 'success', 'User registered successfully. Check your email for verification.', newUser, null);
    } catch (error) {
        console.error(error);
        // Use apiResponse to send a general internal server error response
        const errorMessage = 'Internal server error';
        console.error(errorMessage);
        return apiResponse(res, 500, 'error', errorMessage, null, null);
    }
}


async function verifyEmail(req, res) {
    try {
        const {token} = req.query;

        if (!token) {
            return apiResponse(res, 400, 'error', 'Token is missing', null, null);
        }

        // Verify the token against your secret key
        const decoded = jwt.verify(token, config.secretKey);

        // Update the user's isVerified field in the database
        await User.findOneAndUpdate({email: decoded.email}, {isVerified: true});

        // Send a success response
        return apiResponse(res, 200, 'success', 'Email verified successfully', null, null);
    } catch (error) {
        console.error('Error while verifying email:', error);
        return apiResponse(res, 500, 'error', 'Internal server error', null, null);
    }
}

async function loginUser(req, res) {
    try {
        // Validate the request body against the login schema
        const {error} = loginSchema.validate(req.body);

        if (error) {
            return apiResponse(res, 400, 'error', error.details[0].message, null, null);
        }

        const {email, password} = req.body;

        // Find the user by email
        const user = await User.findOne({email});

        if (!user) {
            return apiResponse(res, 404, 'error', 'User not found', null, null);
        }

        // Check the password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return apiResponse(res, 401, 'error', 'Incorrect password', null, null);
        }

        // Generate and send a JWT token
        const token = jwt.sign({userId: user._id}, config.secretKey, {expiresIn: '1h'});

        // Use apiResponse to send a success response with the token
        return apiResponse(res, 200, 'success', 'Login successful', user, token);
    } catch (error) {
        console.error(error);
        // Use apiResponse to send an internal server error response
        return apiResponse(res, 500, 'error', 'Internal server error', null, null);
    }
}

async function forgotPassword(req, res) {
    try {
        const {email} = req.body;

        // Generate a reset token
        const resetToken = jwt.sign({email}, config.secretKey, {expiresIn: '1h'});

        // Store the reset token and its expiration in the user's document
        await User.updateOne({email}, {
            $set: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: Date.now() + 3600000
            }
        });

        // Send a password reset email
        // const resetPasswordLink = `${config.baseUrl}/api/auth/reset-password/${resetToken}`;
        const resetPasswordLink = `http://localhost:3001/reset-password/${resetToken}`;
        const subject = 'Password Reset';
        const html = `Click the following link to reset your password: <a href="${resetPasswordLink}">Reset Password</a>`;

        await sendEmail(email, subject, html);

        // Use apiResponse to send a success response
        return apiResponse(res, 200, 'success', 'Password reset email sent. Check your inbox.', null, null);
    } catch (error) {
        console.error(error);
        // Use apiResponse to send an internal server error response
        return apiResponse(res, 500, 'error', 'Internal server error', null, null);
    }
}

async function resetPassword(req, res) {
    try {
        const token = req.params.token;
        const newPassword = req.body.newPassword;

        // Verify the reset token and check its expiration
        const decodedToken = jwt.verify(token, config.secretKey);
        const email = decodedToken.email;

        const user = await User.findOne({email});

        if (!user) {
            return apiResponse(res, 404, 'error', 'User not found', null, null);
        }

        if (user.resetPasswordToken !== token || Date.now() > user.resetPasswordExpires) {
            return apiResponse(res, 400, 'error', 'Invalid or expired token', null, null);
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password and reset token fields
        await User.updateOne({email}, {
            $set: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });

        // Use apiResponse to send a success response
        return apiResponse(res, 200, 'success', 'Password reset successfully.', null, null);
    } catch (error) {
        console.error(error);
        // Use apiResponse to send an internal server error response
        return apiResponse(res, 500, 'error', 'Internal server error', null, null);
    }
}

async function logoutUser(req, res) {
    try {
        // Respond with a success message.
        return apiResponse(res, 200, 'success', 'Logout successful', null, null);
    } catch (error) {
        console.error(error);
        // Use apiResponse to send an internal server error response.
        return apiResponse(res, 500, 'error', 'Internal server error', null, null);
    }
}

module.exports = {
    signupUser,
    verifyEmail,
    loginUser,
    forgotPassword,
    resetPassword,
    logoutUser,
};
