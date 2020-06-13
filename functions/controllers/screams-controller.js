const admin = require('firebase-admin');

const getScreams = async (req, res) => {
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
};

const createScream = async (req, res) => {
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
};

exports.getScreams = getScreams;
exports.createScream = createScream;
