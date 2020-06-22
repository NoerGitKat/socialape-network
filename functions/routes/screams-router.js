const express = require('express');
const screamsRouter = express.Router();

// Controllers
const { getScreams, createScream, getSingleScream, createComment } = require('./../controllers/screams-controller');

// Validators
const { validateScream, validateComment } = require('./../validators');

// Utils
const checkAuth = require('./../utils/checkAuth');

screamsRouter.route('/').get(getScreams);
screamsRouter.route('/:screamId').get(getSingleScream);
screamsRouter.route('/:screamId/comment').post(checkAuth, validateComment, createComment);
screamsRouter.route('/new').post(checkAuth, validateScream, createScream);

module.exports = screamsRouter;
