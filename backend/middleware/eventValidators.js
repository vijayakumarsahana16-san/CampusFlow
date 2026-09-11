const { body, param, validationResult } = require('express-validator');

// Helper to handle validation error responses
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Validation failed.', 
            errors: errors.array().map(err => ({ field: err.path, message: err.msg })) 
        });
    }
    next();
};

// 1. Validate Mongo ObjectId parameter
const validateEventId = [
    param('id').isMongoId().withMessage('Invalid Event ID format.'),
    handleValidationErrors
];

// 2. Validate Event Creation Schema
const validateCreateEvent = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required.')
        .isLength({ max: 100 }).withMessage('Title must be under 100 characters.'),
    
    body('eventCode')
        .trim()
        .notEmpty().withMessage('Event Code is required.')
        .isAlphanumeric().withMessage('Event Code must contain only letters and numbers.')
        .isLength({ min: 3, max: 20 }).withMessage('Event Code must be between 3 and 20 characters.'),

    body('category')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Category must be under 50 characters.'),

    body('registrationDeadline')
        .optional({ nullable: true })
        .isISO8601().withMessage('Invalid date format for registration deadline.'),

    body('registrationAllowed')
        .optional()
        .isIn(['INDIVIDUAL', 'TEAM', 'INDIVIDUAL_AND_TEAM'])
        .withMessage('Invalid registration allowed type.'),

    body('minTeamSize')
        .optional()
        .isInt({ min: 1 }).withMessage('Minimum team size must be at least 1.'),

    body('maxTeamSize')
        .optional()
        .isInt({ min: 1 }).withMessage('Maximum team size must be at least 1.')
        .custom((value, { req }) => {
            if (req.body.minTeamSize && Number(value) < Number(req.body.minTeamSize)) {
                throw new Error('Maximum team size cannot be less than minimum team size.');
            }
            return true;
        }),

    handleValidationErrors
];

// 3. Validate Public Registration Schema
const validateRegistration = [
    body('eventCode')
        .trim()
        .notEmpty().withMessage('Event Code is required.'),

    body('registrationType')
        .trim()
        .isIn(['INDIVIDUAL', 'TEAM']).withMessage('Registration type must be INDIVIDUAL or TEAM.'),

    // Validation rules for INDIVIDUAL registration
    body('studentData').custom((value, { req }) => {
        if (req.body.registrationType === 'INDIVIDUAL') {
            if (!value || typeof value !== 'object') {
                throw new Error('Student data object is required for individual registration.');
            }
            if (!value.fullName || !value.fullName.trim()) {
                throw new Error('Student full name is required.');
            }
            if (!value.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())) {
                throw new Error('A valid student email is required.');
            }
        }
        return true;
    }),

    // Validation rules for TEAM registration
    body('teamData').custom((value, { req }) => {
        if (req.body.registrationType === 'TEAM') {
            if (!value || typeof value !== 'object') {
                throw new Error('Team data object is required for team registration.');
            }
            if (!value.teamName || !value.teamName.trim()) {
                throw new Error('Team name is required.');
            }
            if (!Array.isArray(value.members) || value.members.length === 0) {
                throw new Error('Team members list must not be empty.');
            }
            value.members.forEach((member, index) => {
                if (!member.fullName || !member.fullName.trim()) {
                    throw new Error(`Member #${index + 1} full name is required.`);
                }
                if (!member.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email.trim())) {
                    throw new Error(`Member #${index + 1} email is invalid.`);
                }
            });
        }
        return true;
    }),

    handleValidationErrors
];

module.exports = {
    validateEventId,
    validateCreateEvent,
    validateRegistration
};