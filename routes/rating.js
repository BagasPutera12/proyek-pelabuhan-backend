const express = require('express');
const Rating = require('../models/Rating');
const Ship = require('../models/Ship');

const router = express.Router();

router.post('/', async (req, res) => {
  const { shipId, rating, comment } = req.body;
  if (!shipId || !rating) {
    return res.status(400).json({ error: 'Ship ID dan rating wajib diisi.' });
  }
  try {
    const shipExists = await Ship.findById(shipId);
    if (!shipExists) {
      return res.status(404).json({ error: 'Kapal tidak ditemukan.' });
    }
    const newRating = await Rating.create({ shipId, rating, comment });
    res.status(201).json(newRating);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;