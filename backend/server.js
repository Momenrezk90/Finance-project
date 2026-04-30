// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

// Import Routes
const bonusRoutes = require('./routes/bonusRoutes');
const authRoutes = require('./routes/authRoutes');  // Import auth routes
const userRoutes = require('./routes/userRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

// MongoDB connection removed to prevent deployment crash

// API Routes
app.use('/api/bonuses', bonusRoutes);
app.use('/api/auth', authRoutes);  // Add auth routes to the app
app.use('/api/users', userRoutes);


// Set up the server to listen on the specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
