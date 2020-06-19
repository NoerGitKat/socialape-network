const express = require('express');
const userRouter = express.Router();

// Controllers
const { uploadProfilePic } = require('./../controllers/user-controller');

// Utils
const checkAuth = require('./../utils/checkAuth');

userRouter.route('/upload').post(checkAuth, uploadProfilePic);

module.exports = userRouter;
