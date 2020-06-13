const express = require('express');
const screamsRouter = express.Router();

// Controllers
const { getScreams, createScream } = require('./../controllers/screams-controller');

screamsRouter.route('/screams').get(getScreams);
screamsRouter.route('/screams/new').post(createScream);

module.exports = screamsRouter;
