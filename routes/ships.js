const express = require('express');
const Ship = require('../models/Ship');
const Rating = require('../models/Rating');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// GET SEMUA
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

// GET SATU
router.get('/:id', async (req, res) => {
  try {
    const ship = await Ship.findById(req.params.id);
    if (!ship) return res.status(404).json({ error: 'Kapal tidak ditemukan.' });
    const ratings = await Rating.find({ shipId: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json({ ship, ratings });
  } catch (error) {
    res.status(500).json({ error: 'ID tidak valid atau server error.' });
  }
});

// POST BARU
router.post('/', requireAuth, async (req, res) => {
  try {
    const newShip = await Ship.create(req.body);
    res.status(201).json(newShip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE SATU
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const deletedShip = await Ship.findByIdAndDelete(req.params.id);
    if (!deletedShip) return res.status(404).json({ error: 'Kapal tidak ditemukan.' });
    await Rating.deleteMany({ shipId: req.params.id });
    res.status(200).json({ message: 'Kapal berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ error: 'ID tidak valid atau server error.' });
  }
});

// DELETE SEMUA
router.delete('/', requireAuth, async (req, res) => {
  try {
    await Ship.deleteMany({});
    res.status(200).json({ message: 'Semua kapal berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;