const express = require('express');
const authRouter = express.Router();

// Controllers
const { signup } = require('./../controllers/auth-controller');

authRouter.route('/signup').post(signup);

module.exports = authRouter;
