const express = require('express');
const screamsRouter = express.Router();

// Controllers
const {
	getScreams,
	createScream,
	getSingleScream,
	createComment,
	likeScream,
	unlikeScream,
	deleteScream,
} = require('./../controllers/screams-controller');

// Validators
const { validateScream, validateComment } = require('./../validators');

// Utils
const checkAuth = require('./../utils/checkAuth');

screamsRouter.route('/').get(getScreams);
screamsRouter.route('/:screamId/delete').delete(checkAuth, deleteScream);
screamsRouter.route('/:screamId').get(getSingleScream);
screamsRouter.route('/:screamId/comment').post(checkAuth, validateComment, createComment);
screamsRouter.route('/:screamId/like').get(checkAuth, likeScream);
screamsRouter.route('/:screamId/unlike').get(checkAuth, unlikeScream);
screamsRouter.route('/new').post(checkAuth, validateScream, createScream);

module.exports = screamsRouter;
