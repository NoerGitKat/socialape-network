const admin = require('firebase-admin');

const deleteNotificationOnUnlike = async (snapshot, context) => {
	try {
		await admin.firestore().doc(`/notifications/${snapshot.id}`).delete();
		return;
	} catch (err) {
		console.error(err);
		return;
	}
};

module.exports = deleteNotificationOnUnlike;
