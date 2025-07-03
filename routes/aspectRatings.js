// backend/routes/aspectRatings.js (DENGAN ENDPOINT SEMUA SARAN)

const express = require('express');
const AspectRating = require('../models/AspectRating');
const router = express.Router();

// Endpoint untuk MENERIMA data survei baru (tidak berubah)
router.post('/', async (req, res) => {
  try {
    const { aspect, ratings, suggestion } = req.body;
    if (!aspect || !ratings || !Array.isArray(ratings)) {
      return res.status(400).json({ error: 'Data tidak lengkap.' });
    }
    const documentsToInsert = ratings.map(r => ({
      aspect: aspect,
      indicator: r.indicator,
      rating: r.rating,
      suggestion: suggestion
    }));
    await AspectRating.insertMany(documentsToInsert);
    res.status(201).json({ message: 'Terima kasih, masukan Anda telah direkam.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Endpoint untuk MENGAMBIL RINGKASAN DATA (tidak berubah)
router.get('/summary', async (req, res) => {
  try {
    const aspectAverages = await AspectRating.aggregate([
      { $group: { _id: '$aspect', averageRating: { $avg: '$rating' } } },
      { $project: { aspect: '$_id', averageRating: 1, _id: 0 } }
    ]);

    let overallAverage = 0;
    if (aspectAverages.length > 0) {
      const sumOfAverages = aspectAverages.reduce((sum, item) => sum + item.averageRating, 0);
      overallAverage = sumOfAverages / aspectAverages.length;
    }

    // Ambil 3 saran terbaru untuk halaman utama
    const recentSuggestions = await AspectRating.find({
      suggestion: { $exists: true, $ne: '' }
    }).sort({ createdAt: -1 }).limit(3).select('suggestion createdAt');

    res.status(200).json({
      overallAverage: overallAverage,
      aspectAverages: aspectAverages,
      recentSuggestions: recentSuggestions
    });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil ringkasan data.' });
  }
});

// --- RUTE BARU: MENGAMBIL SEMUA SARAN ---
// Method: GET
// Endpoint: /api/aspect-ratings/suggestions
router.get('/suggestions', async (req, res) => {
    try {
        // Ambil semua entri yang memiliki saran, urutkan dari yang terbaru
        const allSuggestions = await AspectRating.find({
            suggestion: { $exists: true, $ne: '' }
        }).sort({ createdAt: -1 }).select('suggestion createdAt');

        // Kita perlu menghilangkan duplikat saran (jika satu saran dikirim bersama beberapa rating)
        const uniqueSuggestions = [];
        const seenSuggestions = new Set();

        for (const item of allSuggestions) {
            if (!seenSuggestions.has(item.suggestion)) {
                seenSuggestions.add(item.suggestion);
                uniqueSuggestions.push(item);
            }
        }

        res.status(200).json(uniqueSuggestions);

    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil daftar saran.' });
    }
});
// --- AKHIR RUTE BARU ---

module.exports = router;