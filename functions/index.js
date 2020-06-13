const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Init application
admin.initializeApp();

exports.getScreams = functions.https.onRequest(async (req, res) => {
	try {
		// Access Firebase DB
		const screamsCollection = await admin.firestore().collection('screams').get();
		const screams = [];
		// Get and push objects in variable
		const screamDocs = await screamsCollection.forEach((doc) => {
			screams.push(doc.data());
		});
		return res.json(screams);
	} catch (err) {
		console.error(err);
		return res.status(500).json(err);
	}
});

exports.createScream = functions.https.onRequest(async (req, res) => {
	if (req.method !== 'POST') {
		return res.status(400).json({ error: 'Method not allowed!' });
	}

	const { handle, body } = req.body;
	const newScream = {
		handle,
		body,
		createdAt: admin.firestore.Timestamp.fromDate(new Date()),
	};

	try {
		const newScreamDoc = await admin.firestore().collection('screams').add(newScream);
		return res.json({ message: `Successfully created new document with ID ${newScreamDoc.id}!` });
	} catch (err) {
		console.error(err);
		return res.status(500).json(err);
	}
});
