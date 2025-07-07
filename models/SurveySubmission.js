// backend/models/SurveySubmission.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const surveySubmissionSchema = new Schema({
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  suggestion: {
    type: String,
    required: false,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('SurveySubmission', surveySubmissionSchema);