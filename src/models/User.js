// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    password: String,
    username: String,
    profile_picture: String,
    isVerified: Boolean,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, {
    timestamps: true // createdAt & updatedAt fields
});

module.exports = mongoose.model('User', userSchema);