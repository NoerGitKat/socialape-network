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
	const { handle, imageUrl } = req.user;

	// Validation
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}

	const newScream = {
		handle,
		body,
		imageUrl,
		createdAt: new Date().toISOString(),
		likeCount: 0,
		commentCount: 0,
	};

	try {
		const newScreamDoc = await admin.firestore().collection('screams').add(newScream);
		newScream.screamId = newScreamDoc.id;
		return res.status(201).json({ message: `Successfully created new document with ID ${newScreamDoc.id}!` });
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
	const { handle, imageUrl } = req.user;
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
		imageUrl,
	};

	try {
		// First check if scream doc exists
		const screamDoc = await admin.firestore().doc(`/screams/${screamId}`).get();
		if (!screamDoc.exists) {
			return res.status(404).json({ message: "Couldn't find scream!" });
		}

		// Increment comment count in scream
		const screamUpdate = await screamDoc.ref.update({ commentCount: screamDoc.data().commentCount + 1 });

		// If exists, add to comments collection
		const commentsCollection = await admin.firestore().collection('comments').add(newComment);

		return res.status(201).json({ message: 'New comment created!', newComment });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: err.message });
	}
};

const likeScream = async (req, res) => {
	const { screamId } = req.params;
	const { handle } = req.user;
	try {
		// 1. Go to database and store scream doc and likes doc in variable
		const likesDoc = admin
			.firestore()
			.collection('likes')
			.where('handle', '==', handle)
			.where('screamId', '==', screamId)
			.limit(1);
		const screamDoc = admin.firestore().doc(`/screams/${screamId}`);

		// 2. check if scream doc with given screamId exists, if it does get data
		let screamData = {};

		const getScreamDoc = await screamDoc.get();
		if (!getScreamDoc.exists) {
			return res.status(404).json({ message: 'Scream not found!' });
		} else {
			screamData = getScreamDoc.data();
			screamData.screamId = screamDoc.id;
		}

		// 3. if likes doc has no like from user in scream, create like doc and increment count in scream doc
		const getLikeDoc = await likesDoc.get();
		if (getLikeDoc.empty) {
			const newLike = { screamId, handle };
			await admin.firestore().collection('likes').add(newLike);
			screamData.likeCount++;
			await screamDoc.update({ likeCount: screamData.likeCount });

			return res.status(200).json({ message: 'Successfully liked scream!' });
		} else {
			return res.status(400).json({ message: 'Scream already liked!' });
		}
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: err.message });
	}
};

const unlikeScream = async (req, res) => {
	const { screamId } = req.params;
	const { handle } = req.user;

	try {
		// 1. Go to db and get like and scream docs
		const likeDoc = admin
			.firestore()
			.collection('likes')
			.where('handle', '==', handle)
			.where('screamId', '==', screamId)
			.limit(1);
		const screamDoc = admin.firestore().doc(`/screams/${screamId}`);

		// 2. check if scream doc with given screamId exists, if it does get data
		let screamData = {};

		const getScreamDoc = await screamDoc.get();
		if (!getScreamDoc.exists) {
			return res.status(404).json({ message: 'Scream not found!' });
		} else {
			screamData = getScreamDoc.data();
			screamData.screamId = getScreamDoc.id;
		}

		// 3. if like doc exists delete and decrease likeCount
		const getLikeDoc = await likeDoc.get();

		if (!getLikeDoc.empty) {
			// 3.1 delete like doc
			await admin.firestore().doc(`/likes/${getLikeDoc.docs[0].id}`).delete();
			screamData.likeCount--;
			// 3.2 decrement likeCount in scream doc
			screamDoc.update({ likeCount: screamData.likeCount });
			return res.status(200).json({ message: 'Scream has been unliked!' });
		} else {
			return res.status(400).json({ message: "Scream hasn't been liked yet!" });
		}
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: err.message });
	}
};

const deleteScream = async (req, res) => {
	const { screamId } = req.params;
	const { handle } = req.user;

	try {
		// 1. First find scream in DB
		const screamDoc = await admin.firestore().doc(`/screams/${screamId}`).get();

		// 2. If found delete scream. Else return 404
		if (!screamDoc.exists) {
			return res.status(404).json({ message: 'Scream not found!' });
		}

		// 3. Check if logged in user equals owner of scream
		if (screamDoc.data().handle !== handle) {
			return res.status(401).json({ message: 'User is not authorized!' });
		}

		// 4. Delete scream
		await screamDoc.ref.delete();

		return res.status(200).json({ message: 'Scream successfully deleted!' });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: err.message });
	}
};

exports.deleteScream = deleteScream;
exports.likeScream = likeScream;
exports.unlikeScream = unlikeScream;
exports.createComment = createComment;
exports.getScreams = getScreams;
exports.getSingleScream = getSingleScream;
exports.createScream = createScream;
