// backend/models/Ship.js
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const shipSchema = new Schema({
  name: {
    type: String,
    required: true, // Nama kapal wajib diisi
  },
  photo: {
    type: String,
    required: false, // Foto tidak wajib
  },
  description: {
    type: String,
    required: false,
  },
  vessel_finder_url: {
    type: String,
    required: false,
  },
  ticket_url: {
    type: String,
    required: false,
  },
  schedule_info: {
    type: String,
    required: false,
  },
}, { timestamps: true }); // timestamps akan otomatis membuat field createdAt dan updatedAt

module.exports = mongoose.model('Ship', shipSchema);