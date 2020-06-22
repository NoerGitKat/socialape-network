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

const getSingleScream = async (req, res) => {
	const { screamId } = req.params;

	try {
		let screamData = {};
		// First get scream data
		const screamDoc = await admin.firestore().doc(`/screams/${screamId}`).get();
		if (!screamDoc.exists) {
			return res.status(404).json({ message: "Couldn't find scream!" });
		}
		screamData = screamDoc.data();
		screamData.screamId = screamDoc.id;

		// Then add comments to screamData
		const commentsCollection = await admin
			.firestore()
			.collection('comments')
			.orderBy('createdAt', 'desc')
			.where('screamId', '==', screamId)
			.get();

		screamData.comments = [];
		commentsCollection.forEach((doc) => {
			screamData.comments.push(doc.data());
		});

		return res.status(201).json(screamData);
	} catch (err) {
		console.error(err);
		return res.status(500).json(err);
	}
};

const createComment = async (req, res) => {
	const { screamId } = req.params;
	const { handle, userImageUrl } = req.user;
	const { comment } = req.body;

	// Validation
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}

	const newComment = {
		body: comment,
		createdAt: new Date().toISOString(),
		screamId,
		handle,
		userImageUrl,
	};

	try {
		// First check if scream doc exists
		const screamDoc = await admin.firestore().doc(`/screams/${screamId}`).get();
		if (!screamDoc.exists) {
			return res.status(404).json({ message: "Couldn't find scream!" });
		}

		// If exists, add to comments collection
		const commentsCollection = await admin.firestore().collection('comments').add(newComment);

		return res.status(201).json({ message: 'New comment created!', newComment });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: err });
	}
};

exports.createComment = createComment;
exports.getScreams = getScreams;
exports.getSingleScream = getSingleScream;
exports.createScream = createScream;
