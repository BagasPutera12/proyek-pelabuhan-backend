// backend/routes/aspectRatings.js

const express = require('express');
const AspectRating = require('../models/AspectRating');
const router = express.Router();

// Endpoint untuk MENERIMA data survei baru
// Frontend akan mengirim array berisi rating untuk beberapa indikator sekaligus
router.post('/', async (req, res) => {
  try {
    const { aspect, ratings, suggestion } = req.body;
    if (!aspect || !ratings || !Array.isArray(ratings)) {
      return res.status(400).json({ error: 'Data tidak lengkap.' });
    }

    // Buat dokumen untuk setiap jawaban indikator
    const documentsToInsert = ratings.map(r => ({
      aspect: aspect,
      indicator: r.indicator,
      rating: r.rating,
      suggestion: suggestion // Sisipkan saran yang sama di setiap entri rating
    }));

    await AspectRating.insertMany(documentsToInsert);
    res.status(201).json({ message: 'Terima kasih, masukan Anda telah direkam.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Endpoint untuk MENGAMBIL SEMUA RINGKASAN DATA (Rata-rata, dll)
router.get('/summary', async (req, res) => {
  try {
    // Lakukan agregasi untuk menghitung rata-rata per aspek
    const aspectAverages = await AspectRating.aggregate([
      {
        $group: {
          _id: '$aspect', // Kelompokkan berdasarkan nama aspek
          averageRating: { $avg: '$rating' } // Hitung rata-rata ratingnya
        }
      },
      {
        $project: { // Ubah nama field agar lebih rapi
          aspect: '$_id',
          averageRating: 1,
          _id: 0
        }
      }
    ]);

    // Hitung rata-rata keseluruhan dari hasil rata-rata per aspek
    let overallAverage = 0;
    if (aspectAverages.length > 0) {
      const sumOfAverages = aspectAverages.reduce((sum, item) => sum + item.averageRating, 0);
      overallAverage = sumOfAverages / aspectAverages.length;
    }

    res.status(200).json({
      overallAverage: overallAverage,
      aspectAverages: aspectAverages
    });

  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil ringkasan data.' });
  }
});

module.exports = router;