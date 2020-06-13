const express = require('express');
const authRouter = express.Router();

// Controllers
const { signup, login } = require('./../controllers/auth-controller');

// Validators
const { validateLogin, validateSignup } = require('./../validators');

authRouter.route('/signup').post(validateSignup, signup);
authRouter.route('/login').post(validateLogin, login);

module.exports = authRouter;
