const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Init application
admin.initializeApp();

exports.getScreams = functions.https.onRequest(async (request, response) => {
	try {
		// Access Firebase DB
		const screamsCollection = await admin.firestore().collection('screams').get();
		let screams = [];
		const screamDocs = await screamsCollection.forEach((doc) => {
			screams.push(doc.data());
		});
		return response.json(screams);
	} catch (err) {
		console.error(err);
	}
	response.send();
});
