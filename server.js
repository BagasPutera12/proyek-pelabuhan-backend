// backend/server.js (VERSI ANTI-GAGAL)

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const shipRoutes = require('./routes/ships');
const ratingRoutes = require('./routes/ratings');

const app = express();

app.use(cors());
app.use(express.json());

// --- PEMERIKSAAN ENVIRONMENT VARIABLE ---
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  // Jika MONGO_URI tidak ada, cetak error yang jelas dan hentikan aplikasi
  console.error('FATAL ERROR: MONGO_URI tidak ditemukan di environment variables.');
  process.exit(1);
}
// ------------------------------------

app.use('/api/ships', shipRoutes);
app.use('/api/ratings', ratingRoutes);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // Gunakan variabel yang sudah kita periksa
    await mongoose.connect(MONGO_URI);
    console.log('✅ Berhasil terhubung ke MongoDB Atlas!');
    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di port: ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Gagal terhubung ke database:', error);
    process.exit(1);
  }
};

startServer();