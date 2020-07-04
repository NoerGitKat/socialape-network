const admin = require('firebase-admin');

const changeProfilePic = async (change) => {
	console.log('before', change.before.data());
	console.log('after', change.after.data());
	if (change.before.data().imageUrl !== change.after.data().imageUrl) {
		console.log('image has changed!');
		// 1. Prepare batch operation
		let batch = admin.firestore().batch();

		// 2. Get complete scream collection, filtered by user handle
		const screamsCollection = await admin
			.firestore()
			.collection('screams')
			.where('handle', '==', change.before.data().handle)
			.get();

		// 3. Update the image of user in each scream made
		screamsCollection.forEach((doc) => {
			const scream = db.doc(`/screams/${doc.id}`);
			batch.update(scream, { userImage: change.after.data().imageUrl });
		});

		// 4. Save changed made in batch operation
		await batch.commit();

		return true;
	}
	return false;
};

module.exports = changeProfilePic;
