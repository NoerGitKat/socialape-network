const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const firebase = require('firebase');

const app = express();
const screamsRouter = require('./routes/screams-router');
const authRouter = require('./routes/auth-router');

const firebaseConfig = {
	apiKey: 'AIzaSyCpDis559px2NoQO0WACl0S4xpo_RPihtI',
	authDomain: 'socialape-8cb27.firebaseapp.com',
	databaseURL: 'https://socialape-8cb27.firebaseio.com',
	projectId: 'socialape-8cb27',
	storageBucket: 'socialape-8cb27.appspot.com',
	messagingSenderId: '594538726867',
	appId: '1:594538726867:web:ee521546446026278b9b26',
	measurementId: 'G-PVC3W5P5LD',
};

// Init application
admin.initializeApp();
firebase.initializeApp(firebaseConfig);

app.use(express.json());
app.use('/screams', screamsRouter);
app.use('/auth', authRouter);

exports.api = functions.region('europe-west1').https.onRequest(app);
