const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', // Reference to the User model
        required: true,
    }, name: {
        type: String, required: true,
    }, coordinates: {
        latitude: {
            type: Number, required: true,
        }, longitude: {
            type: Number, required: true,
        },
    }, description: String,
}, {
    timestamps: true // createdAt & updatedAt fields
});

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark;
