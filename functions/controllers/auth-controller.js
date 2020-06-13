const firebase = require('firebase');
const admin = require('firebase-admin');

const signup = async (req, res) => {
	const { email, password, confirmPassword, handle } = req.body;

	const newUser = {
		email,
		password,
		handle,
	};

	try {
		const foundUser = await admin.firestore().doc(`/users/${newUser.handle}`).get();

		if (foundUser.exists) {
			return res.status(400).json({ message: 'This handle is already taken.' });
		}

		if (password !== confirmPassword) {
			return res.status(422).json({ message: "Passwords don't match!" });
		}

		const createdUser = await firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);

		const idToken = await createdUser.user.getIdToken();

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
