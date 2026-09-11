const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, default: 'General' },
    venue: { type: String, trim: true },
    registrationDeadline: { type: Date },
    eventCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    
    // Registration Type Control
    registrationAllowed: {
      type: String,
      enum: ['INDIVIDUAL', 'TEAM', 'INDIVIDUAL_AND_TEAM'],
      default: 'INDIVIDUAL_AND_TEAM',
    },
    minTeamSize: {
      type: Number,
      default: 2,
      min: [1, 'Minimum team size must be at least 1'],
    },
    maxTeamSize: {
      type: Number,
      default: 4,
      min: [1, 'Maximum team size must be at least 1'],
    },
    
    status: { type: String, default: 'Active' },
    registrationCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);