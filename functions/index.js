const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

const app = express();
const screamsRouter = require('./routes/screams-router');

// Init application
admin.initializeApp();

app.use(express.json());
app.use('/', screamsRouter);

exports.api = functions.https.onRequest(app);
