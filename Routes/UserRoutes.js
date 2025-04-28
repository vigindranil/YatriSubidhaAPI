const express = require('express');
const { sendLoginOtpControllers, verifyLoginOtpControllers, indivisualAllBookingHistoryController,
    specifiDayBookingDetailsController, addProfileDetailsControllers, getProfileDetailsController,
    addProfileImageController,
    deleteProfileImageController } = require('../Controllers/UserControllers');
const router = express.Router();

// User Login Otp Router
router.post('/send-login-otp', sendLoginOtpControllers);

// User Verify Login Otp Router
router.post('/verify-login-otp', verifyLoginOtpControllers);

// Add User Profile Details Router
router.post('/add-profile-details', addProfileDetailsControllers);

// Add User Profile Image Router
router.post('/add-profile-image', addProfileImageController);

//Delete User Profile 
router.post('/delete-profile-image', deleteProfileImageController);

// Get User Profile Details Router
router.post('/get-profile-details', getProfileDetailsController);

// User Verify Login Otp Router
router.post('/individual-all-booking-history', indivisualAllBookingHistoryController);

// User Verify Login Otp Router
router.post('/specific-day-booking-details', specifiDayBookingDetailsController);

module.exports = router;