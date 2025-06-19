// backend/routes/ships.js (VERSI FINAL BERSIH & BENAR)

const express = require('express');
const Ship = require('../models/Ship');
const Rating = require('../models/Rating');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// RUTE GET (PUBLIK) - TIDAK MEMERLUKAN KUNCI API
router.get('/', async (req, res) => {
  try {
    const shipsWithAvgRating = await Ship.aggregate([
      { $lookup: { from: 'ratings', localField: '_id', foreignField: 'shipId', as: 'ratings' } },
      { $addFields: { avgRating: { $ifNull: [{ $avg: '$ratings.rating' }, 0] } } },
      { $project: { ratings: 0 } }
    ]);
    if (!Array.isArray(shipsWithAvgRating)) {
      return res.status(200).json([]);
    }
    res.status(200).json(shipsWithAvgRating);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTE GET BY ID (PUBLIK) - TIDAK MEMERLUKAN KUNCI API
router.get('/:id', async (req, res) => {
  try {
    const shipId = req.params.id;
    const ship = await Ship.findById(shipId);
    if (!ship) {
      return res.status(404).json({ error: 'Kapal tidak ditemukan.' });
    }
    const ratings = await Rating.find({ shipId: shipId }).sort({ createdAt: -1 });
    res.status(200).json({ ship, ratings });
  } catch (error) {
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ error: 'ID Kapal tidak valid.' });
    }
    res.status(500).json({ error: error.message });
  }
});

// RUTE POST (DILINDUNGI) - MEMERLUKAN KUNCI API
router.post('/', requireAuth, async (req, res) => {
  try {
    const newShip = await Ship.create(req.body);
    res.status(201).json(newShip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// RUTE DELETE BY ID (DILINDUNGI) - MEMERLUKAN KUNCI API
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedShip = await Ship.findByIdAndDelete(id);
    if (!deletedShip) {
      return res.status(404).json({ error: 'Kapal tidak ditemukan untuk dihapus.' });
    }
    await Rating.deleteMany({ shipId: id });
    res.status(200).json({ message: 'Kapal dan semua rating terkait berhasil dihapus.', deletedShip });
  } catch (error) {
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ error: 'ID Kapal tidak valid.' });
    }
    res.status(500).json({ error: error.message });
  }
});

// RUTE DELETE SEMUA (DILINDUNGI) - MEMERLUKAN KUNCI API
router.delete('/', requireAuth, async (req, res) => {
  try {
    await Ship.deleteMany({});
    res.status(200).json({ message: 'Semua data kapal berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;