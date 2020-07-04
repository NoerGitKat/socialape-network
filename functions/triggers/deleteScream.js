const deleteScream = async (snapshot, context) => {
	const { screamId } = context.params;

	// 1. Start batch
	const batch = admin.firestore().batch();

	try {
		// 2. Get comments associated with scream
		const commentsCollection = await admin
			.firestore()
			.collection('comments')
			.where('screamId', '==', screamId)
			.get();

		// 3. Delete all comments associated with scream in batch
		commentsCollection.forEach((comment) => batch.delete(admin.firestore().doc(`/comments/${comment.id}`)));

		// 4. Get all likes associated with scream
		const likesCollection = await admin.firestore().collection('likes').where('screamId', '==', screamId).get();

		// 5. Delete all likes associated with scream
		likesCollection.forEach((like) => batch.delete(admin.firestore().doc(`/likes/${comments.id}`)));

		// 6. Get all noticiations associated with scream
		const notificationsCollection = await admin
			.firestore()
			.collection('notifications')
			.where('screamId', '==', screamId)
			.get();

		// 7. Delete all notifications associated with scream
		notificationsCollection.forEach((notificaiton) =>
			batch.delete(admin.firestore().doc(`/notifications/${comments.id}`))
		);

		// 8. Save batch operations
		await batch.commit();

		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
};

module.exports = deleteScream;
