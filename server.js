// backend/server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const shipRoutes = require('./routes/ships');
const ratingRoutes = require('./routes/ratings'); 

// Inisialisasi Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Menggunakan Rute API untuk Kapal
// Semua request ke /api/ships akan ditangani oleh shipRoutes
app.use('/api/ships', shipRoutes);
app.use('/api/ratings', ratingRoutes);
// --- BAGIAN KONEKSI DATABASE DAN SERVER ---

const PORT = process.env.PORT || 5001;

// Membuat fungsi utama untuk menjalankan server
const startServer = async () => {
  try {
    // 1. Coba hubungkan ke MongoDB
    // Gunakan string koneksi dari file .env Anda
    await mongoose.connect(process.env.MONGO_URI);

    // 2. Jika berhasil, tampilkan pesan sukses
    console.log('✅ Berhasil terhubung ke MongoDB Atlas!');

    // 3. BARU JALANKAN SERVER setelah database terhubung
    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di port: ${PORT}`);
    });

  } catch (error) {
    // Jika gagal terhubung, tampilkan pesan error
    console.error('❌ Gagal terhubung ke database:', error.message);
    // Hentikan proses aplikasi jika database tidak bisa terhubung
    process.exit(1);
  }
};

// Panggil fungsi untuk memulai semuanya
startServer();