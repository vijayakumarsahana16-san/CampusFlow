const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const passport = require('passport');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

// Passport configuration
require('./config/passport');

const app = express();

// Middleware
app.use(cors({ origin: 'https://campusflow17.netlify.app', credentials: true }));
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Add missing feature routes here:
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));

// Root Health Check Route
app.get('/', (req, res) => {
  res.send('Campus Flow API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));