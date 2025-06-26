// backend/routes/portSurveys.js (DENGAN ENDPOINT SUMMARY)

const express = require('express');
const PortSurvey = require('../models/PortSurvey');
const router = express.Router();

// Rute untuk MENERIMA data survei baru (tidak berubah)
router.post('/', async (req, res) => {
  try {
    const { answers, suggestion } = req.body;
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Data jawaban survei tidak valid atau kosong.' });
    }
    const newSurvey = new PortSurvey({ answers, suggestion });
    await newSurvey.save();
    res.status(201).json({ message: 'Terima kasih, survei Anda berhasil dikirimkan.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// --- RUTE BARU: MENGAMBIL RINGKASAN HASIL SURVEI ---
// Method: GET
// Endpoint: /api/port-surveys/summary
router.get('/summary', async (req, res) => {
  try {
    // Query 1: Menghitung rata-rata untuk setiap pertanyaan
    const averageRatingsPromise = PortSurvey.aggregate([
      // Tahap 1: "Pecah" setiap survei menjadi satu baris per jawaban
      { $unwind: '$answers' },
      // Tahap 2: Kelompokkan berdasarkan teks pertanyaan dan hitung rata-ratanya
      {
        $group: {
          _id: '$answers.questionText', // Kelompokkan berdasarkan pertanyaan
          averageRating: { $avg: '$answers.rating' } // Hitung rata-rata rating
        }
      },
      // Tahap 3: Urutkan berdasarkan urutan pertanyaan asli (opsional, tapi rapi)
      {
        $project: {
            questionText: '$_id',
            averageRating: 1,
            _id: 0
        }
      }
    ]);

    // Query 2: Mengambil 3 saran terbaru
    const recentSuggestionsPromise = PortSurvey.find({
      // Hanya cari dokumen yang memiliki 'suggestion' dan bukan string kosong
      suggestion: { $exists: true, $ne: '' } 
    })
    .sort({ submittedAt: -1 }) // Urutkan dari yang terbaru
    .limit(3) // Batasi hanya 3 hasil
    .select('suggestion submittedAt'); // Ambil field suggestion dan tanggalnya saja

    // Jalankan kedua query secara bersamaan untuk efisiensi
    const [averageRatings, recentSuggestions] = await Promise.all([
        averageRatingsPromise,
        recentSuggestionsPromise
    ]);

    // Kirim hasilnya sebagai satu objek JSON
    res.status(200).json({ averageRatings, recentSuggestions });

  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil ringkasan survei.', details: error.message });
  }
});
// --- AKHIR RUTE BARU ---


module.exports = router;