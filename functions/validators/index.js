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

exports.validateLogin = validateLogin;
exports.validateSignup = validateSignup;
