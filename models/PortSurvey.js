// backend/models/PortSurvey.js (DENGAN KOLOM SARAN)

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
  questionText: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
}, { _id: false });

const PortSurveySchema = new Schema({
  answers: [AnswerSchema],

  // --- FIELD BARU UNTUK SARAN ---
  suggestion: {
    type: String,
    required: false, // Saran tidak wajib diisi
    trim: true // Menghapus spasi di awal/akhir secara otomatis
  },
  // -----------------------------

  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PortSurvey', PortSurveySchema);