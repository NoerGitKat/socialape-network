const admin = require('firebase-admin');
const BusBoy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { validationResult } = require('express-validator');

const firebaseConfig = require('./../utils/getConfig')();

const uploadProfilePic = (req, res) => {
	const { headers, user } = req;

	const busboy = new BusBoy({ headers });

	let imageFilename = '';
	let imageToBeUploaded = {};

	// Process image and store in file system
	busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
		// Validate that file is of right type
		if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
			return res.status(422).json({ message: 'Wrong file type submitted!' });
		}

		// Rename file
		const splitFilename = filename.split('.');
		const imageExtension = splitFilename[splitFilename.length - 1];
		imageFilename = `${Math.round(Math.random() * 1000000)}.${imageExtension}`;

		// Create filepath in temp folder of OS
		const filepath = path.join(os.tmpdir(), imageFilename);

		imageToBeUploaded = { filepath, mimetype };

		// Create the file using the filesystem by piping it from client to file system as a stream
		file.pipe(fs.createWriteStream(filepath));
	});

	// Store image in Firebase Storage
	busboy.on('finish', async () => {
		try {
			const storedImage = await admin
				.storage()
				.bucket()
				.upload(imageToBeUploaded.filepath, {
					resumable: false,
					metadata: {
						metadata: {
							contentType: imageToBeUploaded.mimetype,
						},
					},
				});

			const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFilename}?alt=media`;

			const updatedDb = await admin.firestore().doc(`/users/${user.handle}`).update({ imageUrl });
			return res.status(201).json({ message: 'Image successfully uploaded!' });
		} catch (err) {
			console.error(err);
			return res.status(500).json({ message: err.message });
		}
	});

	busboy.end(req.rawBody);
};

const getUserDetails = async (req, res) => {
	const { handle } = req.params;

	console.log('handle', handle);

	let userData = {};

	try {
		// 1. Get user document from firestore DB
		const userDoc = await admin.firestore().doc(`/users/${handle}`).get();

		// 2. Return error if no user
		if (!userDoc.exists) {
			return res.status(404).json({ message: "User doesn't exist!" });
		}
		// 3 Add user from doc
		userData.user = userDoc.data();

		// 4. Get user's screams from collection
		const screamsCollection = await admin
			.firestore()
			.collection('screams')
			.where('handle', '==', handle)
			.orderBy('createdAt', 'desc')
			.get();

		// 5. Add user's screams from collection
		userData.screams = [];
		screamsCollection.forEach((doc) =>
			userData.screams.push({
				body: doc.data().body,
				commentCount: doc.data().commentCount,
				createdAt: doc.data().createdAt,
				handle: doc.data().handle,
				imageUrl: doc.data().imageUrl,
				likeCount: doc.data().likeCount,
				screamId: doc.id,
			})
		);

		// 6. Respond with user data
		return res.status(200).json(userData);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: err.message });
	}
};

const getLoggedInUser = async (req, res) => {
	const { handle } = req.user;
	try {
		let userDetails = {};
		const userDoc = await admin.firestore().doc(`/users/${handle}`).get();

		if (userDoc) {
			userDetails.credentials = userDoc.data();
		}

		const likesCollection = await admin.firestore().collection('likes').where('handle', '==', handle).get();

		userDetails.likes = [];

		likesCollection.forEach((doc) => userDetails.likes.push(doc.data()));

		const notificationsCollection = await admin
			.firestore()
			.collection('notifications')
			.where('recipient', '==', handle)
			.orderBy('createdAt', 'desc')
			.limit(10)
			.get();

		userDetails.notifications = [];

		notificationsCollection.forEach((doc) =>
			userDetails.notifications.push({
				recipient: doc.data().recipient,
				sender: doc.data().sender,
				createdAt: doc.data().createdAt,
				screamId: doc.data().screamId,
				type: doc.data().type,
				read: doc.data().read,
				notificationId: doc.data().notificationId,
			})
		);

		return res.status(200).json(userDetails);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: err.message });
	}
};

const addUserDetails = async (req, res) => {
	const { bio, website, location } = req.body;
	const { handle } = req.user;

	// Validation
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}

	try {
		const userDetails = {
			bio,
			website,
			location,
		};

		await admin.firestore().doc(`/users/${handle}`).update(userDetails);

		return res.status(201).json({ message: 'User details successfully updated!' });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: err.message });
	}
};

const markNotificationsAsRead = async (req, res) => {
	try {
		// Create a batch write operation
		let batch = admin.firestore().batch();
		req.body.forEach((notificationId) => {
			const notificationDoc = admin.firestore().doc(`/notifications/${notificationId}`);
			batch.update(notificationDoc, { read: true });
		});
		await batch.commit();

		return res.status(204).json({ message: 'Notifications are now read!' });
	} catch (err) {
		console.error(err);
	}
};

exports.uploadProfilePic = uploadProfilePic;
exports.getLoggedInUser = getLoggedInUser;
exports.addUserDetails = addUserDetails;
exports.markNotificationsAsRead = markNotificationsAsRead;
exports.getUserDetails = getUserDetails;
