// backend/routes/portSurveys.js

const express = require('express');
const PortSurvey = require('../models/PortSurvey');
const router = express.Router();

// Rute untuk MENERIMA data survei baru
// Method: POST
// Endpoint: /api/port-surveys/
router.post('/', async (req, res) => {
  try {
    // Data yang kita harapkan adalah sebuah objek yang memiliki field 'answers'
    // 'answers' ini berisi array dari jawaban
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Data jawaban survei tidak valid atau kosong.' });
    }

    const newSurvey = new PortSurvey({ answers });
    await newSurvey.save();

    res.status(201).json({ message: 'Terima kasih, survei Anda berhasil dikirimkan.' });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;