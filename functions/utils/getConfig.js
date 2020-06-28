const functions = require("firebase-functions");
let config = require("./../env.json");

if (Object.keys(functions.config()).length) {
  config = functions.config();
}

const getConfig = () => {
  return {
    apiKey: config.socialape.firebase_api_key,
    authDomain: "socialape-8cb27.firebaseapp.com",
    databaseURL: "https://socialape-8cb27.firebaseio.com",
    projectId: "socialape-8cb27",
    storageBucket: config.socialape.storage_id,
    messagingSenderId: "594538726867",
    appId: config.socialape.app_id,
    measurementId: "G-PVC3W5P5LD",
  };
};

module.exports = getConfig;
