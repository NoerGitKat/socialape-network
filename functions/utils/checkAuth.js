const admin = require('firebase-admin');

const checkAuth = async (req, res, next) => {
	const { authorization } = req.headers;

	// First check if the request contains a token at all
	let idToken;
	if (authorization && authorization.startsWith('Bearer ')) {
		idToken = authorization.split('Bearer ')[1];
	} else {
		return res.status(403).json({ message: 'You must be logged in!' });
	}

	// Then verify the token
	try {
		const verifiedToken = await admin.auth().verifyIdToken(idToken);

		req.user = verifiedToken;

		const user = await admin.firestore().collection('users').where('userId', '==', req.user.uid).limit(1).get();

		req.user.handle = user.docs[0].data().handle;
		req.user.userImageUrl = user.docs[0].data().imageUrl;

		return next();
	} catch (err) {
		console.error(err);
		return res.status(403).json({ message: err });
	}
};

module.exports = checkAuth;
