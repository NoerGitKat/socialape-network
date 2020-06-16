const express = require('express');
const screamsRouter = express.Router();

// Controllers
const { getScreams, createScream } = require('./../controllers/screams-controller');

// Validators
const { validateScream } = require('./../validators');

// Utils
const checkAuth = require('./../utils/checkAuth');

screamsRouter.route('/').get(getScreams);
screamsRouter.route('/new').post(checkAuth, validateScream, createScream);

module.exports = screamsRouter;
