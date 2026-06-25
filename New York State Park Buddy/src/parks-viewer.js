import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

// Firebase API info
const firebaseConfig = {
    apiKey: "AIzaSyCd71n5KJR24W_9LD792WB5WintH8xcpw8",
    authDomain: "nys-park-buddy-68b5d.firebaseapp.com",
    databaseURL: "https://nys-park-buddy-68b5d-default-rtdb.firebaseio.com",
    projectId: "nys-park-buddy-68b5d",
    storageBucket: "nys-park-buddy-68b5d.appspot.com",
    messagingSenderId: "476676865949",
    appId: "1:476676865949:web:b4367f7bbee64daf3ff974",
    measurementId: "G-29Q88PQJYB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Reference to the database
const db = getDatabase(app);
const parksRef = ref(db, "parks/");

// Check for changes in list
const parksChanged = (snapshot) => {
    const parksList = document.querySelector("#parks-list");
    parksList.innerHTML = "";

    // If no parks exist, display this message
    if (!snapshot.exists()) {
        parksList.innerHTML = "<p>No parks have been favorited yet.</p>";
        return;
    }

    const parksArray = [];

    // Loop through park list, collect its info (ID, name, and likes) and put it into an array
    snapshot.forEach(childSnapshot => {
        const parkId = childSnapshot.key;
        const parkData = childSnapshot.val();
        parksArray.push({
            id: parkId,
            name: parkData.name || "Unknown Park",
            likes: parkData.likes || 0
        });
    });

    // Sort parks by descending likes
    parksArray.sort((a, b) => b.likes - a.likes);

    // Build an ordered list
    const ol = document.createElement("ol");

    parksArray.forEach(park => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${park.name}</strong> (${park.id}) – Likes: ${park.likes}`;
        ol.appendChild(li);
    });

    parksList.appendChild(ol);
};

// Initialize the app
const init = () => {
    onValue(parksRef, parksChanged);
};

// Start the app
init();
