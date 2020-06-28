const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const firebase = require("firebase");

const app = express();

// Routers
const screamsRouter = require("./routes/screams-router");
const authRouter = require("./routes/auth-router");
const userRouter = require("./routes/user-router");

const serviceAccount = require("./serviceAccountKey.json");
const firebaseConfig = require("./utils/getConfig")();

// Init application
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://socialape-8cb27.firebaseio.com",
  storageBucket: firebaseConfig.storageBucket,
});
firebase.initializeApp(firebaseConfig);

app.use(express.json());
app.use("/screams", screamsRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);

exports.api = functions.region("europe-west1").https.onRequest(app);

exports.createNotificationOnLike = functions
  .region("europe-west1")
  .firestore.document("likes/{id}")
  .onCreate(async (snapshot) => {
    try {
      const screamDoc = await admin.firestore().doc(
        `/screams/${snapshot.data().screamId}`,
      ).get();
      if (screamDoc.exists) {
        const likeNotification = await admin.firestore().doc(
          `/notifications/${snapshot.id}`,
        ).set({
          createdAt: new Date().toISOString(),
          recipient: screamDoc.data().handle,
          sender: snapshot.data().handle,
          type: "like",
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
  });

exports.deleteNotificationOnUnlike = functions
  .region("europe-west1")
  .firestore.document("likes/{id}")
  .onDelete(async (snapshot) => {
    try {
      await admin.firestore().doc(`/notifications/${snapshot.id}`).delete();
      return;
    } catch (err) {
      console.error(err);
      return;
    }
  });

exports.createNotificationOnComment = functions
  .region("europe-west1")
  .firestore.document("comments/{id}")
  .onCreate(async (snapshot) => {
    try {
      const screamDoc = await admin.firestore().doc(
        `/screams/${snapshot.data().screamId}`,
      ).get();
      if (screamDoc.exists) {
        const commentNotification = await admin.firestore().doc(
          `/notifications/${snapshot.id}`,
        ).set({
          createdAt: new Date().toISOString(),
          recipient: screamDoc.data().handle,
          sender: snapshot.data().handle,
          type: "comment",
          read: false,
          screamId: screamDoc.id,
        });
        return commentNotification;
      }
    } catch (err) {
      console.error(err);
      return;
    }
  });
