const express = require('express');
const screamsRouter = express.Router();

// Controllers
const { getScreams, createScream } = require('./../controllers/screams-controller');

screamsRouter.route('/').get(getScreams);
screamsRouter.route('/new').post(createScream);

module.exports = screamsRouter;
