// Initialize the map with custom CRS for a static image
const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -3,
    maxZoom: 2,
}).setView([0, 0], 0);

// Define the image bounds based on the 9800x6798 map size
const bounds = [[0, 0], [6798, 9800]];
const imageUrl = '/Resources/faerun_map.jpg';
L.imageOverlay(imageUrl, bounds, { opacity: 0.7 }).addTo(map);
map.fitBounds(bounds);
map.setMaxBounds(bounds);
map.options.maxBoundsViscosity = 1.0;

let savedMarkers = JSON.parse(localStorage.getItem("savedMarkers") || "[]");
let selectedMarker = null;
let markerMap = {};

// Load markers from localStorage
function loadMarkers() {
    savedMarkers.forEach(markerData => {
        const marker = createMarker(markerData.lat, markerData.lng, markerData.name, markerData.description, markerData.id);
        markerMap[markerData.name.toLowerCase()] = marker;
    });
}

// Function to create and add a marker with popup content
function createMarker(lat, lng, name, description, id = Date.now()) {
    const marker = L.marker([lat, lng]).addTo(map);
    marker._id = id;
    marker.bindPopup(createPopupContent(name, description, marker));

    marker.bindTooltip(name, {
        permanent: false,
        direction: "top"
    });

    marker.on('click', function() {
        selectedMarker = marker;
    });

    return marker;
}

// Create popup content with an edit button
function createPopupContent(name, description, marker) {
    return `
        <b>${name}</b><br>${description}<br>
        <button onclick="editMarker('${marker._id}')">Edit</button>
    `;
}

// Function to add a marker via popup form
function addMarker(lat, lng) {
    if (lat >= bounds[0][0] && lat <= bounds[1][0] && lng >= bounds[0][1] && lng <= bounds[1][1]) {
        const popupContent = `
            <b>Add New Place</b><br>
            <input type="text" id="placeName" placeholder="Place Name"><br>
            <textarea id="placeDescription" placeholder="Description"></textarea><br>
            <button onclick="saveMarker(${lat}, ${lng})">Add</button>
        `;
        L.popup().setLatLng([lat, lng]).setContent(popupContent).openOn(map);
    } else {
        alert("Cannot place marker outside of map bounds.");
    }
}

// Save new marker data and update localStorage
function saveMarker(lat, lng) {
    const name = document.getElementById("placeName").value;
    const description = document.getElementById("placeDescription").value;

    if (name && description) {
        const marker = createMarker(lat, lng, name, description);
        savedMarkers.push({ id: marker._id, lat, lng, name, description });
        markerMap[name.toLowerCase()] = marker;

        // Update localStorage with new marker
        localStorage.setItem("savedMarkers", JSON.stringify(savedMarkers));
        map.closePopup();
    } else {
        alert("Please enter both a name and description for the marker.");
    }
}

// Function to search and open a marker by name
function searchMarker() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    
    // Check if any markers exist in the markerMap
    if (Object.keys(markerMap).length === 0) {
        alert("No markers available on the map to search.");
        return;
    }

    // Find the marker by name in the markerMap
    const marker = markerMap[searchInput];

    if (marker) {
        // Smoothly fly to the marker's location, set zoom level, and center it
        map.flyTo(marker.getLatLng(), 1.8, { duration: 1.5 });
        
        // Open the popup after flying to the location
        marker.openPopup();
    } else {
        alert("Place not found!");
    }
}

// Function to delete the selected marker
function deleteMarker() {
    if (selectedMarker) {
        // Remove the selected marker from the map
        map.removeLayer(selectedMarker);

        // Filter out the selected marker from the savedMarkers array
        savedMarkers = savedMarkers.filter(m => m.id !== selectedMarker._id);

        // Remove the selected marker from markerMap by name, if it exists
        const markerName = Object.keys(markerMap).find(name => markerMap[name] === selectedMarker);
        if (markerName) {
            delete markerMap[markerName];
        }

        // Update localStorage with the updated savedMarkers array
        localStorage.setItem("savedMarkers", JSON.stringify(savedMarkers));

        // Clear the selectedMarker reference
        selectedMarker = null;
        return;
    } else {
        alert("No marker is selected.");
    }
}

// Function to save edits and update the marker
function editMarker(markerId) {
    // Find the marker data in savedMarkers array
    const markerData = savedMarkers.find(m => m.id === Number(markerId));
    if (!markerData) {
        alert("Marker not found.");
        return;
    }

    // Get the corresponding Leaflet marker from markerMap
    const marker = markerMap[markerData.name.toLowerCase()];
    
    // Create an editable popup content
    const popupContent = `
        <b>Edit Place</b><br>
        <input type="text" id="editPlaceName" value="${markerData.name}" placeholder="Place Name"><br>
        <textarea id="editPlaceDescription" placeholder="Description">${markerData.description}</textarea><br>
        <button onclick="saveEdits('${markerId}')">Save Changes</button>
    `;

    // Update the popup content with the editable form and open it
    marker.setPopupContent(popupContent).openPopup();
}

function saveEdits(markerId) {
    const newName = document.getElementById("editPlaceName").value;
    const newDescription = document.getElementById("editPlaceDescription").value;

    // Find the index of the marker in savedMarkers array
    const markerIndex = savedMarkers.findIndex(m => m.id === Number(markerId));

    if (markerIndex !== -1) {
        const oldName = savedMarkers[markerIndex].name.toLowerCase();

        // Update the marker data in savedMarkers array
        savedMarkers[markerIndex].name = newName;
        savedMarkers[markerIndex].description = newDescription;

        // Update the corresponding marker on the map
        const marker = markerMap[oldName];
        marker.bindPopup(createPopupContent(newName, newDescription, marker)).openPopup();

        // Remove the old name key from markerMap if the name has changed
        if (oldName !== newName.toLowerCase()) {
            delete markerMap[oldName];
            markerMap[newName.toLowerCase()] = marker;
        }

        // Update localStorage with the new data
        localStorage.setItem("savedMarkers", JSON.stringify(savedMarkers));

        alert("Marker updated successfully.");
    } else {
        alert("Failed to update marker.");
    }
}

// Function to save markers to server with filename prompt
function saveMarkersToServer() {
    const markersData = JSON.parse(localStorage.getItem("savedMarkers")) || [];

    // Check if there are no markers to save
    if (markersData.length === 0) {
        console.error('Error saving markers: Nothing to save!');
        alert('No markers to save!');
        return;
    }

    // Prompt the user for a filename
    const filename = prompt("Enter a filename to save markers:");
    if (!filename) {
        alert("Save canceled: No filename provided.");
        return;
    }

    // Send a POST request to save markers with the provided filename
    fetch(`/save-markers/${filename}`, {  // Sending filename as part of the URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(markersData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message); // Notify the user of successful save
        console.log("Saved filename:", data.filename);
    })
    .catch(error => {
        console.error('Error saving markers:', error);
        alert('Failed to save markers to server');
    });
}

// Function to load markers from server file
function loadMarkersFromServer(filename) {
    fetch(`/load-markers/${filename}.json`)
        .then(response => {
            if (!response.ok) throw new Error('Markers file not found');
            return response.json();
        })
        .then(data => {
            clearMarkers();  // Clear current markers on map and in localStorage
            data.forEach(markerData => {
                const { lat, lng, name, description, id } = markerData;
                const marker = createMarker(lat, lng, name, description, id);
                map.addLayer(marker);
                savedMarkers.push({ id, lat, lng, name, description });
                markerMap[name.toLowerCase()] = marker;
            });
            localStorage.setItem("savedMarkers", JSON.stringify(savedMarkers));
            alert(`Markers loaded from ${filename}`);
        })
        .catch(error => {
            console.error('Error loading markers:', error);
            alert('Failed to load markers from server');
        });
}

// Helper function to clear all markers from map and localStorage
function clearMarkers() {
    // Remove each marker layer from the map
    Object.values(markerMap).forEach(marker => map.removeLayer(marker));

    // Clear all markers from savedMarkers array and markerMap object
    savedMarkers = [];
    markerMap = {};

    // Remove marker data from localStorage
    localStorage.removeItem("savedMarkers");
}

// Add click event to map for adding markers within bounds
map.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    addMarker(lat, lng);
});


document.addEventListener("keydown", function(event) {
    if (event.key === "Delete" && selectedMarker) {
        deleteMarker();
    }
});

// Load markers from localStorage on page load
document.addEventListener("DOMContentLoaded", loadMarkers);
