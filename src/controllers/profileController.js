// profileController.js

const User = require('../models/User');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const config = require('../config/config');
const {apiResponse} = require('../helpers/apiResponse');
const {
    updateProfileValidation,
    updateUserValidation,
} = require('../validators/profileValidator'); // Corrected import statement

// Function to generate a random number between 1 and 9999
const generateRandomNumber = () => {
    return Math.floor(Math.random() * 9999) + 1;
};

// Multer configuration for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.params.userId;
        const userFolder = `uploads/${userId}/profile_picture`; // Create a folder for each user based on userId

        // Create the user's profile_picture folder if it doesn't exist
        fs.mkdirSync(userFolder, {recursive: true});

        cb(null, userFolder);
    },
    filename: (req, file, cb) => {
        // Generate a random number and remove spaces from the original file name
        const randomPrefix = generateRandomNumber();
        const originalName = file.originalname.replace(/\s+/g, '');

        // Use the random prefix and modified original name for the uploaded profile picture
        const modifiedFileName = `${randomPrefix}_${originalName}`;

        cb(null, modifiedFileName);
    },
});

const upload = multer({storage: storage}).single('profile_picture'); // Specify 'profile_picture' as the field name


// Update user profile image and profile picture field in a single request
async function updateProfile(req, res) {
    try {
        const userId = req.params.userId;

        // Call the file upload middleware
        upload(req, res, async (err) => {
            if (err) {
                return apiResponse(res, 500, 'error', 'Failed to upload profile picture.', err.message, null);
            }

            // Validate the request data against the schema
            const {error} = updateProfileValidation.validate(req.body);

            if (error) {
                return apiResponse(res, 400, 'error', 'Validation errors', null, error.details);
            }

            // Check if a file was uploaded
            if (!req.file) {
                return apiResponse(res, 400, 'error', 'No file uploaded.', null, null);
            }

            const newFileName = `uploads/${userId}/profile_picture/${req.file.filename}`; // Adjust the filename

            // Find the user to get the old profile picture filename
            const user = await User.findById(userId);
            const oldFileName = user.profile_picture;

            // Check if an old profile picture exists and if it does, delete it
            if (oldFileName && fs.existsSync(oldFileName)) {
                fs.unlinkSync(oldFileName); // Delete the old image file
            }

            // Update the user's profile picture field in the database with the new filename
            await User.findByIdAndUpdate(userId, {profile_picture: newFileName});

            // Now, you can save the user document with the file information
            const updatedUser = await User.findById(userId);
            updatedUser.profile_picture = newFileName;
            await updatedUser.save();

            // Construct the URL for the new image
            const imageUrl = `${config.baseUrl}/${newFileName}`;

            // Create the response object
            const response = {
                status: {
                    statusCode: 200,
                    status: 'success',
                    message: 'Profile picture updated successfully.',
                },
                data: imageUrl,
                token: null,
            };

            // Respond with the formatted response using apiResponse
            return apiResponse(res, 200, 'success', 'Profile picture updated successfully.', imageUrl, null);
        });
    } catch (error) {
        console.error('Error while updating profile and picture field:', error);

        // Create the error response object
        const errorResponse = {
            status: {
                statusCode: 500,
                status: 'error',
                message: 'Internal server error',
            },
            data: null,
            token: null,
        };

        // Respond with the formatted error response using apiResponse
        return apiResponse(res, 500, 'error', 'Internal server error', null, null);
    }
}

// Retrieve user information by ID
async function getUserById(req, res) {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (!user) {
            return apiResponse(res, 404, 'error', 'User not found', null, null);
        }
        return apiResponse(res, 200, 'success', 'User found', user, null);
    } catch (error) {
        console.error('Error while retrieving user by ID:', error);
        return apiResponse(res, 500, 'error', 'Internal server error', null, null);
    }
}

// Update user information
async function updateUser(req, res) {
    try {
        const userId = req.params.userId;
        const updatedUserData = req.body;

        // Validate the request data against the schema
        const {error} = updateUserValidation.validate(updatedUserData);

        if (error) {
            return apiResponse(res, 400, 'error', 'Validation errors', null, error.details);
        }


        const user = await User.findByIdAndUpdate(userId, updatedUserData, {new: true});

        if (!user) {
            return apiResponse(res, 404, 'error', 'User not found', null, null);
        }

        return apiResponse(res, 200, 'success', 'User updated successfully', user, null);
    } catch (error) {
        console.error('Error while updating user:', error);

        // Create the error response object
        const errorResponse = {
            status: {
                statusCode: 500,
                status: 'error',
                message: 'Internal server error',
            },
            data: null,
            token: null,
        };

        // Respond with the formatted error response using apiResponse
        return apiResponse(res, 500, 'error', 'Internal server error', null, null);
    }
}

module.exports = {
    updateProfile,
    getUserById,
    updateUser
};
