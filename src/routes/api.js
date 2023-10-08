// routes/api.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');
const bookmarkController = require('../controllers/bookmarkController');


// Authentication management routes
router.post('/signup', authController.signupUser);
router.post('/login', authController.loginUser);
router.get('/verify/:token', authController.verifyEmail);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/logout', authMiddleware.isAuthenticated, authController.logoutUser);

// User profile management routes
router.get('/profile/:userId', authMiddleware.isAuthenticated, profileController.getUserById);
router.put('/update-profile/:userId', authMiddleware.isAuthenticated, profileController.updateUser);
router.put('/update-profile-image/:userId', authMiddleware.isAuthenticated, profileController.updateProfile);

// Bookmark management routes
router.post('/bookmarks/:userId/add', authMiddleware.isAuthenticated, bookmarkController.addBookmark);
router.get('/bookmarks/:userId', authMiddleware.isAuthenticated, bookmarkController.getUserBookmarks);
router.delete('/bookmarks/:userId/:bookmarkId/delete', authMiddleware.isAuthenticated, bookmarkController.deleteBookmark);


module.exports = router;