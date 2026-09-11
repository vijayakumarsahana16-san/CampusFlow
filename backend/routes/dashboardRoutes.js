const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Team = require('../models/Team');
const Student = require('../models/Student');

router.get('/stats', async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ status: 'Active' });
    const totalTeams = await Team.countDocuments();
    const totalStudents = await Student.countDocuments();
    
    // Total Registrations = Total individual students + total teams
    const totalRegistrations = totalStudents + totalTeams;

    res.status(200).json({
      totalEvents,
      activeEvents,
      totalRegistrations,
      totalTeams,
      totalStudents,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

module.exports = router;