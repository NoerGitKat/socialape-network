const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const firebase = require('firebase');

const app = express();

// Routers
const screamsRouter = require('./routes/screams-router');
const authRouter = require('./routes/auth-router');
const userRouter = require('./routes/user-router');

const serviceAccount = require('./serviceAccountKey.json');
const firebaseConfig = require('./utils/getConfig')();

// Init application
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://socialape-8cb27.firebaseio.com',
	storageBucket: firebaseConfig.storageBucket,
});
firebase.initializeApp(firebaseConfig);

app.use(express.json());
app.use('/screams', screamsRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter);

exports.api = functions.region('europe-west1').https.onRequest(app);
