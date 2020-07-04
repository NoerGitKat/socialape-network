const admin = require('firebase-admin');

const createNotificationOnComment = async (snapshot) => {
	try {
		const screamDoc = await admin.firestore().doc(`/screams/${snapshot.data().screamId}`).get();
		// Only create notification if the scream exists and it's NOT made by authenticated user
		if (screamDoc.exists && screamDoc.data().handle !== snapshot.data().handle) {
			const commentNotification = await admin.firestore().doc(`/notifications/${snapshot.id}`).set({
				createdAt: new Date().toISOString(),
				recipient: screamDoc.data().handle,
				sender: snapshot.data().handle,
				type: 'comment',
				read: false,
				screamId: screamDoc.id,
			});
			return commentNotification;
		}
	} catch (err) {
		console.error(err);
		return;
	}
};

module.exports = createNotificationOnComment;
