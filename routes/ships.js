// backend/routes/ships.js (VERSI PERBAIKAN SINTAKS FINAL)

const express = require('express');
const Ship = require('../models/Ship');
const Rating = require('../models/Rating');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// GET SEMUA KAPAL (PUBLIK)
router.get('/', async (req, res) => {
  try {
    const ships = await Ship.aggregate([
      { $lookup: { from: 'ratings', localField: '_id', foreignField: 'shipId', as: 'ratings' } },
      { $addFields: { avgRating: { $ifNull: [{ $avg: '$ratings.rating' }, 0] } } },
      { $project: { ratings: 0 } }
    ]);
    res.status(200).json(ships);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET SATU KAPAL BY ID (PUBLIK)
router.get('/:id', async (req, res) => {
  try {
    const ship = await Ship.findById(req.params.id);
    if (!ship) {
      return res.status(404).json({ error: 'Kapal tidak ditemukan.' });
    }
    const ratings = await Rating.find({ shipId: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json({ ship, ratings });
  } catch (error) {
    res.status(500).json({ error: 'ID Kapal tidak valid atau terjadi kesalahan server.' });
  }
});

// MEMBUAT KAPAL BARU (DILINDUNGI)
router.post('/', requireAuth, async (req, res) => {
  try {
    const newShip = await Ship.create(req.body);
    res.status(201).json(newShip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// MENGHAPUS SATU KAPAL BY ID (DILINDUNGI)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const deletedShip = await Ship.findByIdAndDelete(req.params.id);
    if (!deletedShip) {
      return res.status(404).json({ error: 'Kapal tidak ditemukan untuk dihapus.' });
    }
    await Rating.deleteMany({ shipId: req.params.id });
    res.status(200).json({ message: 'Kapal berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ error: 'ID Kapal tidak valid atau terjadi kesalahan server.' });
  }
});

// MENGHAPUS SEMUA KAPAL (DILINDUNGI) - HANYA UNTUK DEVELOPMENT
router.delete('/', requireAuth, async (req, res) => {
  try {
    await Ship.deleteMany({});
    res.status(200).json({ message: 'Semua data kapal berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;