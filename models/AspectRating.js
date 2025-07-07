// backend/models/AspectRating.js (DENGAN LINK KE SUBMISI)

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AspectRatingSchema = new Schema({
  // Field baru untuk menghubungkan ke "amplop" survei
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SurveySubmission',
    required: true
  },
  aspect: {
    type: String,
    required: true,
  },
  indicator: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
}, { timestamps: true });

module.exports = mongoose.model('AspectRating', AspectRatingSchema);