const express = require('express');
const os = require('os');
const path = require('path');
const fs = require('fs');
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/Resources', express.static(path.join(__dirname, 'Resources')));
app.use(express.static(__dirname)); // Also serve the root directory for index.html

// Directory to store saved markers
const saveDirectory = path.join(__dirname, 'Saved-Markers');

// Ensure the directory exists
if (!fs.existsSync(saveDirectory)) {
    fs.mkdirSync(saveDirectory);
}

// Function to get the local IP address
function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
        for (const interfaceInfo of interfaces[interfaceName]) {
            // Find the IPv4 address that is not internal (127.0.0.1)
            if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {
                return interfaceInfo.address;
            }
        }
    }
    return 'IP address not found';
}

// Endpoint to save markers data to a JSON file
app.post('/save-markers/:filename', (req, res) => {
    const markersData = req.body;
    const filename = req.params.filename; // Retrieve the filename from the URL parameter

    // Ensure the filename has a .json extension
    const safeFilename = filename.endsWith('.json') ? filename : `${filename}.json`;

    // Write the data to a JSON file in the directory
    fs.writeFile(path.join(saveDirectory, safeFilename), JSON.stringify(markersData, null, 2), (err) => {
        if (err) {
            console.error('Error saving markers:', err);
            return res.status(500).send('Failed to save markers');
        }
        console.log(`Markers saved as ${safeFilename}`);
        res.send({ message: `Markers saved as ${safeFilename}`, filename: safeFilename });
    });
});


// Endpoint to load markers data from a specified JSON file
app.get('/load-markers/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(saveDirectory, filename);

    // Read the file if it exists and return the markers data
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error loading markers:', err);
            return res.status(404).send('Markers file not found');
        }
        res.json(JSON.parse(data));
    });
});

// Set the server to listen on port 3000 (or any other port you prefer)
const PORT = 3000;
const HOST = getLocalIPAddress();
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running and accessible at http://${HOST}:${PORT}`);
});
