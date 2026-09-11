const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    dob: {
      type: Date,
      required: [true, 'Date of Birth is required'],
    },
    college: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
    },
    course: {
      type: String,
      trim: true,
    },
    year: {
      type: String,
      trim: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    eventName: {
      type: String,
      required: true,
    },
    registrationId: {
      type: String,
      required: true,
    },
    registrationType: {
      type: String,
      enum: ['INDIVIDUAL', 'TEAM'],
      required: true,
    },
    regType: {
      type: String,
      enum: ['INDIVIDUAL', 'TEAM'],
      required: true,
    },
    role: {
      type: String,
      enum: ['INDIVIDUAL', 'TEAM_LEAD', 'MEMBER'],
      default: 'INDIVIDUAL',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);