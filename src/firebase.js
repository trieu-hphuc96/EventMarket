var firebase = require("firebase");

var config = {
    apiKey: "AIzaSyAUkrXhdrTYAqqURzpHNFHnQeC4nW60N18",
    authDomain: "event-market-acb32.firebaseapp.com",
    databaseURL: "https://event-market-acb32.firebaseio.com",
    projectId: "event-market-acb32",
    storageBucket: "event-market-acb32.appspot.com",
    messagingSenderId: "991529472315"
};
firebase.initializeApp(config);

export default firebase;