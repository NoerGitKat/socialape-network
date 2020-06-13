const firebase = require('firebase');
const admin = require('firebase-admin');
const { validationResult } = require('express-validator');

const signup = async (req, res) => {
	const { email, password, confirmPassword, handle } = req.body;

	// Validation
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}

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

const login = async (req, res) => {
	const { email, password } = req.body;

	// Validation
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}

	try {
		const loggedInUser = await firebase.auth().signInWithEmailAndPassword(email, password);
		const idToken = await loggedInUser.user.getIdToken();

		return res.status(200).json({ token: idToken });
	} catch (err) {
		console.error(err);
		return res.status(500).json(err);
	}
};

exports.signup = signup;
exports.login = login;
