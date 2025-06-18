// backend/models/Ship.js (VERSI BARU DENGAN DATA TABEL)

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Skema untuk satu baris data di dalam tabel
const PortActivitySchema = new Schema({
  no: { type: Number, required: true },
  namaKapal: { type: String, required: true },
  gtLoa: { type: String, required: true }, // GT / LOA
  agen: { type: String, required: true },
  labuh: { type: String, required: true },
  rencanaSandar: { type: String, required: true },
  komoditi: { type: String, required: true },
  bongkarMuat: { type: String, required: true }, // Bongkar / Muat
  asalTujuan: { type: String, required: true }, // Asal - Tujuan
}, { _id: false }); // _id: false agar tidak dibuatkan ID untuk setiap baris

const shipSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    required: false,
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
  // --- FIELD BARU UNTUK TABEL ---
  portActivities: [PortActivitySchema]
  // -----------------------------
}, { timestamps: true });

module.exports = mongoose.model('Ship', shipSchema);