// backend/models/AspectRating.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AspectRatingSchema = new Schema({
  aspect: { // contoh: "Keamanan & Keselamatan"
    type: String,
    required: true,
  },
  indicator: { // contoh: "Saya merasa aman berkat kehadiran fasilitas informasi terkait keamanan."
    type: String,
    required: true,
  },
  rating: { // nilai 1-5
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  suggestion: { // Saran opsional dari pengguna
    type: String,
    required: false,
    trim: true
  }
}, { timestamps: true }); // timestamps akan mencatat kapan rating diberikan

module.exports = mongoose.model('AspectRating', AspectRatingSchema);