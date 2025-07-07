// backend/routes/fullSurvey.js

const express = require('express');
const SurveySubmission = require('../models/SurveySubmission');
const AspectRating = require('../models/AspectRating');
const router = express.Router();

// Endpoint untuk menerima satu submisi survei lengkap
router.post('/', async (req, res) => {
  try {
    const { userName, userEmail, ratings, suggestion } = req.body;

    // Validasi data yang masuk
    if (!userName || !userEmail || !ratings || !Array.isArray(ratings)) {
      return res.status(400).json({ error: 'Data tidak lengkap. Nama, email, dan rating wajib diisi.' });
    }

    // 1. Buat "amplop" submisi terlebih dahulu untuk mendapatkan ID
    const newSubmission = new SurveySubmission({ userName, userEmail, suggestion });
    const savedSubmission = await newSubmission.save();
    const submissionId = savedSubmission._id;

    // 2. Siapkan semua dokumen rating dengan menambahkan submissionId
    const ratingsToInsert = ratings.map(r => ({
      submissionId: submissionId,
      aspect: r.aspect,
      indicator: r.indicator,
      rating: r.rating
    }));

    // 3. Simpan semua data rating sekaligus
    await AspectRating.insertMany(ratingsToInsert);

    // TODO: Tambahkan logika kirim email ke userEmail di sini nanti

    res.status(201).json({ message: 'Terima kasih! Survei dan masukan Anda telah berhasil dikirimkan.' });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;