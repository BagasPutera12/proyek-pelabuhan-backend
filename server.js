// backend/server.js (VERSI FINAL DENGAN CORS)

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Pastikan cors diimpor
const shipRoutes = require('./routes/ships');
const ratingRoutes = require('./routes/ratings');

const app = express();

// --- BAGIAN PENTING: KONFIGURASI CORS ---
const corsOptions = {
  // Ganti dengan URL Vercel Anda yang sebenarnya!
  // Pastikan tidak ada slash '/' di akhir.
  origin: 'https://proyek-pelabuhan-frontend.vercel.app', // GANTI DENGAN URL VERCEL ANDA
  optionsSuccessStatus: 200 
};
app.use(cors(corsOptions));
// --- AKHIR BAGIAN CORS ---

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
