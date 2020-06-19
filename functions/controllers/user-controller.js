const admin = require('firebase-admin');
const BusBoy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');

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
			return res.status(500).json({ message: err });
		}
	});

	busboy.end(req.rawBody);
};

exports.uploadProfilePic = uploadProfilePic;
