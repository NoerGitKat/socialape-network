const firebase = require('firebase');
const admin = require('firebase-admin');

const signup = async (req, res) => {
	const { email, password, confirmPassword, handle } = req.body;

	try {
		const foundUser = await admin.firestore().doc(`/users/${handle}`).get();

		if (foundUser.exists) {
			return res.status(400).json({ message: 'This handle is already taken.' });
		}

		if (password !== confirmPassword) {
			return res.status(422).json({ message: "Passwords don't match!" });
		}

		// Create user for auth
		const createdUser = await firebase.auth().createUserWithEmailAndPassword(email, password);

		// Create auth token
		const idToken = await createdUser.user.getIdToken();

		const userCreds = {
			email,
			handle,
			createdAt: new Date().toISOString(),
			userId: createdUser.user.uid,
		};

		// Create user doc in collection
		await admin.firestore().doc(`/users/${userCreds.handle}`).set(userCreds);

		return res.status(201).json({ message: `A new user with token ${idToken} has been created!` });
	} catch (err) {
		console.error(err);
		if (err.code === 'auth/email-already-in-use') {
			return res.status(400).json({ message: 'Email already in use!' });
		} else {
			return res.status(500).json(err);
		}
	}
};

exports.signup = signup;
