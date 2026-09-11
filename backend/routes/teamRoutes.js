const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

// GET all teams with populated event title
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().populate('eventId', 'title').sort({ createdAt: -1 });
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teams', error: error.message });
  }
});

module.exports = router;