const Bookmark = require('../models/bookmark');
const {apiResponse} = require('../helpers/apiResponse');

// Create a bookmark for a specific user
exports.addBookmark = async (req, res) => {
    try {
        const {name, coordinates, description} = req.body;
        const userId = req.params.userId;

        const bookmark = new Bookmark({
            userId,
            name,
            coordinates,
            description,
        });

        const savedBookmark = await bookmark.save();

        apiResponse(res, 201, 'success', 'Bookmark added successfully', savedBookmark);
    } catch (error) {
        apiResponse(res, 500, 'error', 'Unable to add bookmark', null);
    }
};

// Get user's bookmarks
exports.getUserBookmarks = async (req, res) => {
    try {
        const userId = req.params.userId; // Extract userId from URL parameter

        const bookmarks = await Bookmark.find({userId: userId});

        // Use the apiResponse helper to send a response
        apiResponse(res, 200, 'success', 'User bookmarks retrieved successfully', bookmarks);
    } catch (error) {
        // Use the apiResponse helper to send an error response
        apiResponse(res, 500, 'error', 'Unable to retrieve bookmarks', null);
    }
};

// Delete a bookmark for a specific user
exports.deleteBookmark = async (req, res) => {
    try {
        const userId = req.params.userId; // Extract userId from URL parameter
        const bookmarkId = req.params.bookmarkId; // Extract bookmarkId from URL parameter

        const deletedBookmark = await Bookmark.findOneAndDelete({
            _id: bookmarkId, // Use _id to specify the unique identifier of the bookmark
            userId: userId,    // Use user to specify the user's ID as a condition
        });

        if (!deletedBookmark) {
            return apiResponse(res, 404, 'error', 'Bookmark not found', null);
        }

        // Use the apiResponse helper to send a success message
        apiResponse(res, 200, 'success', 'Bookmark deleted successfully', null);
    } catch (error) {
        // Use the apiResponse helper to send an error response
        apiResponse(res, 500, 'error', 'Unable to delete bookmark', null);
    }
};
