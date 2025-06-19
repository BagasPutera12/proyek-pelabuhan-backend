// backend/server.js (VERSI FINAL DENGAN PERBAIKAN CORS)

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const shipRoutes = require('./routes/ships');
const ratingRoutes = require('./routes/ratings');

const app = express();

// --- BAGIAN PERBAIKAN CORS ---
// Menggunakan cors() tanpa opsi akan mengizinkan permintaan dari semua origin.
// Ini adalah cara paling pasti untuk memastikan masalahnya ada di CORS.
app.use(cors());
// --- AKHIR PERBAIKAN ---

app.use(express.json());

// Menggunakan Rute API
app.use('/api/ships', shipRoutes);
app.use('/api/ratings', ratingRoutes);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Berhasil terhubung ke MongoDB Atlas!');
    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di port: ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Gagal terhubung ke database:', error.message);
    process.exit(1);
  }
};

startServer();