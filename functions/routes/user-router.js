const express = require('express');
const userRouter = express.Router();

// Controllers
const { uploadProfilePic, getUserDetails, addUserDetails } = require('./../controllers/user-controller');

// Validators
const { validateUserDetails } = require('./../validators');

// Utils
const checkAuth = require('./../utils/checkAuth');

userRouter.route('/').get(checkAuth, getUserDetails);
userRouter.route('/add').post([checkAuth, validateUserDetails, addUserDetails]);
userRouter.route('/upload').post(checkAuth, uploadProfilePic);

module.exports = userRouter;
