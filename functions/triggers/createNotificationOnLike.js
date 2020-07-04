const admin = require('firebase-admin');

const createNotificationOnLike = async (snapshot) => {
	try {
		const screamDoc = await admin.firestore().doc(`/screams/${snapshot.data().screamId}`).get();
		// Only create notification if the scream exists and it's NOT made by authenticated user
		if (screamDoc.exists && screamDoc.data().handle !== snapshot.data().handle) {
			const likeNotification = await admin.firestore().doc(`/notifications/${snapshot.id}`).set({
				createdAt: new Date().toISOString(),
				recipient: screamDoc.data().handle,
				sender: snapshot.data().handle,
				type: 'like',
				read: false,
				screamId: screamDoc.id,
			});

			return likeNotification;
		} else {
			throw new Error("Like doesn't exist!");
		}
	} catch (err) {
		console.error(err);
		return;
	}
};

module.exports = createNotificationOnLike;
