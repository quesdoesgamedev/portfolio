
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";



import * as map from "./map.js";
import * as ajax from "./ajax.js";
import { readFromLocalStorage, writeToLocalStorage } from './storage.js';


const firebaseConfig = {
	apiKey: "AIzaSyCd71n5KJR24W_9LD792WB5WintH8xcpw8",
	authDomain: "nys-park-buddy-68b5d.firebaseapp.com",
	projectId: "nys-park-buddy-68b5d",
	storageBucket: "nys-park-buddy-68b5d.firebasestorage.app",
	messagingSenderId: "476676865949",
	appId: "1:476676865949:web:b4367f7bbee64daf3ff974",
	measurementId: "G-29Q88PQJYB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();

// NB - it's easy to get [longitude,latitude] coordinates with this tool: http://geojson.io/
const lnglatNYS = [-75.71615970715911, 43.025810763917775];
const lnglatUSA = [-98.5696, 39.8282];

let geojson;
// Import favorites from local storage
let favoriteIds = readFromLocalStorage('favoriteIds');
// If the array is not valid, set it to a blank array
if (!Array.isArray(favoriteIds)) {
	favoriteIds = [];
}

// Button references
const favoriteBtn = document.getElementById('favorite-btn');
const deleteBtn = document.getElementById('delete-btn');

let selectedParkId = null;

// State handlers for favorite buttons
const updateFavoriteButtons = () => {
	if (selectedParkId === null) {
		favoriteBtn.disabled = true;
		deleteBtn.disabled = true;
	} else if (favoriteIds.includes(selectedParkId)) {
		favoriteBtn.disabled = true;
		deleteBtn.disabled = false;
	} else {
		favoriteBtn.disabled = false;
		deleteBtn.disabled = true;
	}
}

// Update favorites panel on index.js
// This is a combined version of refreshFavorites() and createFavoriteElement()
const updateFavoritesPanel = () => {
	const favoritesPanel = document.getElementById('favorites-list');
    favoritesPanel.innerHTML = '';

	// Loop through each ID
    favoriteIds.forEach(id => {
        const park = geojson.features.find(p => p.id === id);
        if (park) {
            const a = document.createElement('a');
            a.className = "panel-block";
            a.id = park.id;
            a.onclick = () => {
                selectedParkId = park.id;
                updateFavoriteButtons();
				map.setZoomLevel(6);
                map.flyTo(park.geometry.coordinates);
            };
            a.innerHTML = `
                <span class="panel-icon">
                    <i class="fas fa-map-pin"></i>
                </span>
                ${park.properties.title}
            `;
            favoritesPanel.appendChild(a);
        }
    });
}

// Favorites button click handler
favoriteBtn.addEventListener('click', () => {
	if (!favoriteIds.includes(selectedParkId)) {
		favoriteIds.push(selectedParkId);
		writeToLocalStorage('favoriteIds', favoriteIds);
		updateFavoritesPanel();
		updateFavoriteButtons();
		incrementParkFavorite(selectedParkId); // we'll implement later
	}
});

// Delete button click handler
deleteBtn.addEventListener('click', () => {
	const index = favoriteIds.indexOf(selectedParkId);
	if (index !== -1) {
		favoriteIds.splice(index, 1);
		writeToLocalStorage('favoriteIds', favoriteIds);
		updateFavoritesPanel();
		updateFavoriteButtons();
		decrementParkFavorite(selectedParkId); // we'll implement later
	}
});

// Increment like count in database
const incrementParkFavorite = (parkId) => {
	// Get references to attributes in park (name, likes, ID)
    const parkRef = ref(db, "parks/" + parkId + "/likes");
    const feature = geojson.features.find(p => p.id === parkId);
    const parkName = feature?.properties?.title || "Unknown Park";

    get(parkRef)
        .then((snapshot) => {
            let currentLikes = snapshot.val() || 0;
            return set(ref(db, "parks/" + parkId), {
                name: parkName,
                likes: currentLikes + 1
            });
        })
        .then(() => {
            console.log(`Favorited ${parkName} (ID: ${parkId})`);
        })
        .catch((error) => {
            console.error("Error incrementing favorite:", error);
        });
}

// Decrement like count in database
const decrementParkFavorite = (parkId) => {
    const parkRef = ref(db, "parks/" + parkId + "/likes");

    const feature = geojson.features.find(p => p.id === parkId);
    const parkName = feature?.properties?.title || "Unknown Park";

    get(parkRef)
        .then((snapshot) => {
            let currentLikes = snapshot.val() || 0;
			// If a park in the database has no favorites, remove it
            if (currentLikes <= 1) {
                remove(ref(db, "parks/" + parkId));
            } 
			else {
                return set(ref(db, "parks/" + parkId), {
                    name: parkName,
                    likes: currentLikes - 1
                });
            }
        })
        .then(() => {
            console.log(`Decremented favorite for ${parkName}`);
        })
        .catch((error) => {
            console.error("Error decrementing favorite:", error);
        });
}

// Set up UI for map controls (done in starter exercise)
const setupUI = () => {
	// NYS Zoom 5.2
	document.querySelector("#btn1").onclick = () => {
		map.setZoomLevel(5.2);
		map.setPitchAndBearing(0, 0);
		map.flyTo(lnglatNYS);
	};
	// NYS isometric view
	document.querySelector("#btn2").onclick = () => {
		map.setZoomLevel(5.5);
		map.setPitchAndBearing(45, 0);
		map.flyTo(lnglatNYS);
	};
	// World zoom 0
	document.querySelector("#btn3").onclick = () => {
		map.setZoomLevel(3);
		map.setPitchAndBearing(0, 0);
		map.flyTo(lnglatUSA);
	};

	updateFavoritesPanel();

}

// App initial function (Done in HW4 Starter)
const init = () => {
	map.initMap(lnglatNYS);
	ajax.downloadFile("data/parks.geojson", (str) => {
		geojson = JSON.parse(str);
		console.log(geojson);
		map.addMarkersToMap(geojson, (id) => {
			selectedParkId = id;
			updateFavoriteButtons();
			showFeatureDetails(id);
		  });
		  
		setupUI();
	});
};

// Grabs parks by ID in geoJSON (Done in HW4 Starter)
const getFeatureById = (id) => {
	return geojson.features.find(feature => feature.id === id);
};

// Displays feature details (Done in HW4 Starter)
const showFeatureDetails = (id) => {
	console.log(`showFeatureDetails - id=${id}`);
	const feature = getFeatureById(id);

	if (feature) {
		const props = feature.properties;

		// Title
		document.querySelector("#details-1").innerHTML = `Info for ${props.title}`;

		// Details
		document.querySelector("#details-2").innerHTML = `
			<p><strong>Address:</strong> ${props.address}</p>
			<p><strong>Phone:</strong> <a href="tel:${props.phone}">${props.phone}</a></p>
			<p><strong>Website:</strong> <a href="${props.url}" target="_blank">${props.url}</a></p>
		`;

		// Description
		document.querySelector("#details-3").innerHTML = props.description;
	}
	else {
		document.querySelector("#details-1").innerHTML = `Feature not found for id=${id}`;
		document.querySelector("#details-2").innerHTML = "";
		document.querySelector("#details-3").innerHTML = "";
	}
};

init();