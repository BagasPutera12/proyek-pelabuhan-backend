// backend/models/Ship.js (STRUKTUR BARU)

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const shipSchema = new Schema({
  // Data lama yang tetap dipakai
  name: { type: String, required: true },
  photo: { type: String, required: false },
  description: { type: String, required: false },
  vessel_finder_url: { type: String, required: false },
  ticket_url: { type: String, required: false },

  // --- FIELD-FIELD BARU DARI TABEL ---
  gtLoa: { type: String },
  agen: { type: String },
  labuh: { type: String },
  rencanaSandar: { type: String },
  komoditi: { type: String },
  bongkarMuat: { type: String },
  asalTujuan: { type: String },
  // ------------------------------------

}, { timestamps: true });

module.exports = mongoose.model('Ship', shipSchema);