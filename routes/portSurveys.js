// backend/routes/portSurveys.js (DENGAN LOGIKA SARAN)

const express = require('express');
const PortSurvey = require('../models/PortSurvey');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    // Ambil 'answers' dan juga 'suggestion' dari body request
    const { answers, suggestion } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Data jawaban survei tidak valid atau kosong.' });
    }

    // Buat dokumen baru dengan menyertakan suggestion
    const newSurvey = new PortSurvey({ 
      answers, 
      suggestion // Akan disimpan jika ada, atau diabaikan jika tidak ada
    });
    await newSurvey.save();

    res.status(201).json({ message: 'Terima kasih, survei Anda berhasil dikirimkan.' });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;