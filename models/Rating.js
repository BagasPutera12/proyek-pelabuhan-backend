// backend/models/Rating.js
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ratingSchema = new Schema({
  rating: {
    type: Number,
    required: true,
    min: 1, // Nilai minimal 1
    max: 5, // Nilai maksimal 5
  },
  comment: {
    type: String,
    required: false, // Komentar tidak wajib
  },
  // Ini adalah kunci untuk menghubungkan rating ke kapal
  shipId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Ship' // Merujuk ke model 'Ship'
  }
}, { timestamps: true });

module.exports = mongoose.model('Rating', ratingSchema);