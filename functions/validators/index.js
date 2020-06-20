const { check } = require('express-validator');

const validateLogin = [
	check('email').isEmail().withMessage('You must fill in a valid email address!'),
	check('password').isLength({ min: 5 }).withMessage('Your password must be at least 5 characters long!'),
];
const validateSignup = [
	check('handle').not().isEmpty().withMessage('You must fill in a handle!'),
	check('email').isEmail().withMessage('You must fill in a valid email address!'),
	check('password').isLength({ min: 5 }).withMessage('Your password must be at least 5 characters long!'),
];
const validateScream = [check('body').not().isEmpty().withMessage('You have to fill in a scream!')];
const validateUserDetails = [
	check('bio').isLength({ min: 6 }).withMessage('Your bio should contain at least 6 characters!'),
	check('website').isURL().withMessage('Your website should have a valid URL!'),
	check('location').isLength({ min: 3 }).withMessage('Your address should have at least 3 characters!'),
];

exports.validateLogin = validateLogin;
exports.validateSignup = validateSignup;
exports.validateScream = validateScream;
exports.validateUserDetails = validateUserDetails;
