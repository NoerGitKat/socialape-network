const admin = require('firebase-admin');
const { validationResult } = require('express-validator');

const getScreams = async (req, res) => {
	try {
		// Access Firebase DB
		const screamsCollection = await admin.firestore().collection('screams').orderBy('createdAt', 'desc').get();
		const screams = [];
		// Get and push objects in variable
		const screamDocs = screamsCollection.forEach((doc) => {
			screams.push({ ...doc.data(), screamId: doc.id });
		});
		return res.json(screams);
	} catch (err) {
		console.error(err);
		return res.status(500).json(err);
	}
};

const createScream = async (req, res) => {
	const { body } = req.body;
	const { handle } = req.user;

	// Validation
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}

	const newScream = {
		handle,
		body,
		createdAt: new Date().toISOString(),
	};

	try {
		const newScreamDoc = await admin.firestore().collection('screams').add(newScream);
		return res.json({ message: `Successfully created new document with ID ${newScreamDoc.id}!` });
	} catch (err) {
		console.error(err);
		return res.status(500).json(err);
	}
};

exports.getScreams = getScreams;
exports.createScream = createScream;
