// server/index.js - Basic Express Server
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Create an Express application
const app = express();

// Apply middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies

// Define a simple route
app.get('/', (req, res) => {
  res.send('Scribble Game Server is running!');
});

// Define the port to listen on
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});