const express = require('express');
const userRouter = express.Router();

// Controllers
const {
	uploadProfilePic,
	getLoggedInUser,
	addUserDetails,
	getUserDetails,
	markNotificationsAsRead,
} = require('./../controllers/user-controller');

// Validators
const { validateUserDetails } = require('./../validators');

// Utils
const checkAuth = require('./../utils/checkAuth');

userRouter.route('/').get(checkAuth, getLoggedInUser);
userRouter.route('/:handle').get(getUserDetails);
userRouter.route('/add').post(checkAuth, validateUserDetails, addUserDetails);
userRouter.route('/upload').post(checkAuth, uploadProfilePic);
userRouter.post('/notifications').post(checkAuth, markNotificationsAsRead);

module.exports = userRouter;
