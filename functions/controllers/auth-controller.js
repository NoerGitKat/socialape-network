const firebase = require('firebase');

const signup = async (req, res) => {
	// TODO: Validate data
	const { email, password, confirmPassword, handle } = req.body;

	if (password !== confirmPassword) {
		return res.status(422).json({ message: "Passwords don't match!" });
	}

	const newUser = {
		email,
		password,
		handle,
	};

	try {
		const createdUser = await firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
		return res.status(201).json({ message: `A new user with ID ${createdUser.user.uid} has been created!` });
	} catch (err) {
		console.error(err);
		return res.status(500).json(err);
	}
};

exports.signup = signup;
