const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const firebase = require('firebase');

const app = express();

// Routers
const screamsRouter = require('./routes/screams-router');
const authRouter = require('./routes/auth-router');
const userRouter = require('./routes/user-router');

// Triggers
const {
	changeProfilePic,
	createNotificationOnComment,
	createNotificationOnLike,
	deleteNotificationOnUnlike,
	deleteScream,
} = require('./triggers');

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

// Redirect routes
app.use('/screams', screamsRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter);

exports.api = functions.region('europe-west1').https.onRequest(app);

exports.onCreateNotificationOnLike = functions
	.region('europe-west1')
	.firestore.document('likes/{id}')
	.onCreate(createNotificationOnLike);

exports.onDeleteNotificationOnUnlike = functions
	.region('europe-west1')
	.firestore.document('likes/{id}')
	.onDelete(deleteNotificationOnUnlike);

exports.onCreateNotificationOnComment = functions
	.region('europe-west1')
	.firestore.document('comments/{id}')
	.onCreate(createNotificationOnComment);

exports.onChangeProfilePic = functions
	.region('europe-west1')
	.firestore.document('/users/{userId}')
	.onUpdate(changeProfilePic);

exports.onDeleteScream = functions
	.region('europe-west1')
	.firestore.document('/screams/{screamId}')
	.onDelete(deleteScream);
