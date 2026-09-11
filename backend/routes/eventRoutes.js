const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { body, param, validationResult } = require('express-validator');

const Event = require('../models/Event');
const Student = require('../models/Student');
const Team = require('../models/Team');

// Helper to escape user input before regex instantiation
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Middleware to catch validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// ==========================================
// ADMIN / DIRECTORY ROUTES
// ==========================================

// GET /api/events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Server error fetching events.', error: error.message });
    }
});

// POST /api/events - Create Event with Express-Validator
router.post('/', [
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('eventCode').trim().notEmpty().withMessage('Event Code is required.'),
    body('minTeamSize').optional().isInt({ min: 1 }),
    body('maxTeamSize').optional().isInt({ min: 1 }),
    validate
], async (req, res) => {
    try {
        const {
            title, description, category, venue,
            registrationDeadline, eventCode, registrationAllowed,
            minTeamSize, maxTeamSize
        } = req.body;

        const safeCode = escapeRegex(eventCode);
        const existing = await Event.findOne({ 
            eventCode: { $regex: new RegExp(`^${safeCode}$`, 'i') } 
        });
        
        if (existing) {
            return res.status(400).json({ message: 'Event code already in use.' });
        }

        const newEvent = new Event({
            title: title.trim(),
            description: description ? description.trim() : '',
            category: category || 'General',
            venue: venue ? venue.trim() : '',
            registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
            eventCode: eventCode.trim().toUpperCase(),
            registrationAllowed: registrationAllowed || 'INDIVIDUAL_AND_TEAM',
            minTeamSize: Number(minTeamSize) || 2,
            maxTeamSize: Number(maxTeamSize) || 4,
            status: 'Active',
            registrationCount: 0
        });

        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Server error creating event.', error: error.message });
    }
});

// DELETE /api/events/:id
router.delete('/:id', [
    param('id').isMongoId().withMessage('Invalid Event ID format.'),
    validate
], async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found.' });
        }
        res.json({ message: 'Event deleted successfully.' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Server error deleting event.', error: error.message });
    }
});

// ==========================================
// PUBLIC REGISTRATION ROUTES
// ==========================================

// GET /api/events/public/:eventCode
router.get('/public/:eventCode', async (req, res) => {
    try {
        const safeCode = escapeRegex(req.params.eventCode);
        const event = await Event.findOne({ 
            eventCode: { $regex: new RegExp(`^${safeCode}$`, 'i') } 
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found. Please check the event code.' });
        }

        if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
            return res.status(400).json({ message: 'Registration Deadline Passed', isClosed: true, event });
        }

        if (event.status === 'Closed' || event.status === 'Draft') {
            return res.status(400).json({ message: 'Registration is currently closed for this event.', isClosed: true, event });
        }

        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching event details.', error: error.message });
    }
});

// POST /api/events/register - Public Registration using Atomic Database Transactions
router.post('/register', [
    body('eventCode').trim().notEmpty(),
    body('registrationType').isIn(['INDIVIDUAL', 'TEAM']),
    validate
], async (req, res) => {
    // Start session for atomic rollbacks
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { eventCode, registrationType, studentData, teamData } = req.body;
        const safeCode = escapeRegex(eventCode);

        const event = await Event.findOne({ 
            eventCode: { $regex: new RegExp(`^${safeCode}$`, 'i') } 
        }).session(session);

        if (!event) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Event not found.' });
        }

        if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Registration Deadline Passed.' });
        }

        // Validate event permissions
        if (event.registrationAllowed === 'INDIVIDUAL' && registrationType !== 'INDIVIDUAL') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'This event only accepts individual registrations.' });
        }
        if (event.registrationAllowed === 'TEAM' && registrationType !== 'TEAM') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'This event only accepts team registrations.' });
        }

        const registrationId = `REG-${Math.floor(100000 + Math.random() * 900000)}`;

        // Handle Individual Registration
        if (registrationType === 'INDIVIDUAL') {
            if (!studentData || !studentData.email) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: 'Student data and email are required.' });
            }

            const safeEmail = studentData.email.trim().toLowerCase();
            const existingStudent = await Student.findOne({ email: safeEmail, eventId: event._id }).session(session);
            
            if (existingStudent) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: 'This email is already registered for this event.' });
            }

            const newStudent = new Student({
                ...studentData,
                email: safeEmail,
                eventId: event._id,
                eventName: event.title,
                registrationId,
                registrationType: 'INDIVIDUAL',
                regType: 'INDIVIDUAL'
            });

            await newStudent.save({ session });
            await Event.findByIdAndUpdate(event._id, { $inc: { registrationCount: 1 } }).session(session);

            await session.commitTransaction();
            session.endSession();

            return res.status(201).json({
                message: 'Registration successful!',
                registrationId,
                eventName: event.title,
                studentName: newStudent.fullName,
            });
        }

        // Handle Team Registration
        if (registrationType === 'TEAM') {
            if (!teamData || !teamData.teamName || !Array.isArray(teamData.members) || teamData.members.length === 0) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: 'Invalid team payload provided.' });
            }

            const { teamName, members } = teamData;

            if (members.length < event.minTeamSize || members.length > event.maxTeamSize) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ 
                    message: `Team size must be between ${event.minTeamSize} and ${event.maxTeamSize} members.` 
                });
            }

            // Check duplicate emails across submitted members
            const memberEmails = members.map(m => m.email ? m.email.trim().toLowerCase() : null);
            if (new Set(memberEmails).size !== memberEmails.length) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: 'Duplicate emails inside team payload.' });
            }

            // Check if any member is already registered for the event
            const existingMember = await Student.findOne({ email: { $in: memberEmails }, eventId: event._id }).session(session);
            if (existingMember) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: `Student (${existingMember.email}) is already registered.` });
            }

            const savedMemberIds = [];
            for (let i = 0; i < members.length; i++) {
                const member = members[i];
                const newMember = new Student({
                    ...member,
                    email: member.email.trim().toLowerCase(),
                    eventId: event._id,
                    eventName: event.title,
                    registrationId,
                    registrationType: 'TEAM',
                    regType: 'TEAM',
                    role: i === 0 ? 'TEAM_LEAD' : 'MEMBER'
                });
                const savedMember = await newMember.save({ session });
                savedMemberIds.push(savedMember._id);
            }

            const newTeam = new Team({
                teamName: teamName.trim(),
                eventId: event._id,
                teamLead: savedMemberIds[0],
                members: savedMemberIds,
                registrationId
            });

            await newTeam.save({ session });
            await Event.findByIdAndUpdate(event._id, { $inc: { registrationCount: 1 } }).session(session);

            await session.commitTransaction();
            session.endSession();

            return res.status(201).json({
                message: 'Team Registration successful!',
                registrationId,
                eventName: event.title,
                teamName: newTeam.teamName,
                studentName: members[0].fullName,
            });
        }

        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: 'Invalid registration type.' });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Registration Error Details:', error);
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
});

module.exports = router;