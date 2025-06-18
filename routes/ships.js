// backend/routes/ships.js (VERSI FINAL LENGKAP)

const express = require('express');
const Ship = require('../models/Ship');
const Rating = require('../models/Rating');

const router = express.Router();

// ROUTE 1: GET SEMUA KAPAL (DENGAN RATA-RATA RATING)
router.get('/', async (req, res) => {
  try {
    const shipsWithAvgRating = await Ship.aggregate([
      { $lookup: { from: 'ratings', localField: '_id', foreignField: 'shipId', as: 'ratings' } },
      { $addFields: { avgRating: { $ifNull: [{ $avg: '$ratings.rating' }, 0] } } },
      { $project: { ratings: 0 } }
    ]);
    if (!Array.isArray(shipsWithAvgRating)) {
      console.error("Hasil agregasi bukan array!", shipsWithAvgRating);
      return res.status(200).json([]);
    }
    res.status(200).json(shipsWithAvgRating);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ROUTE 2: GET SATU KAPAL BERDASARKAN ID BESERTA SEMUA RATINGNYA
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

// ROUTE 3: MEMBUAT KAPAL BARU (STRUKTUR BARU)
router.post('/', async (req, res) => {
  try {
    const newShip = await Ship.create({ 
      name: req.body.name,
      photo: req.body.photo,
      description: req.body.description,
      vessel_finder_url: req.body.vessel_finder_url,
      ticket_url: req.body.ticket_url,
      gtLoa: req.body.gtLoa,
      agen: req.body.agen,
      labuh: req.body.labuh,
      rencanaSandar: req.body.rencanaSandar,
      komoditi: req.body.komoditi,
      bongkarMuat: req.body.bongkarMuat,
      asalTujuan: req.body.asalTujuan
    });
    res.status(201).json(newShip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Cari dan hapus kapal berdasarkan ID
    const deletedShip = await Ship.findByIdAndDelete(id);

    if (!deletedShip) {
      return res.status(404).json({ error: 'Kapal tidak ditemukan untuk dihapus.' });
    }

    // Opsional: Hapus juga semua rating yang terkait dengan kapal ini
    await Rating.deleteMany({ shipId: id });

    res.status(200).json({ message: 'Kapal dan semua rating terkait berhasil dihapus.', deletedShip });

  } catch (error) {
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ error: 'ID Kapal tidak valid.' });
    }
    res.status(500).json({ error: error.message });
  }
});
// --- ROUTE 4: MENGHAPUS SEMUA KAPAL (YANG HILANG) ---
// Method: DELETE
// Endpoint: /api/ships/
router.delete('/', async (req, res) => {
  try {
    await Ship.deleteMany({}); // Perintah untuk menghapus semua dokumen di koleksi Ship
    res.status(200).json({ message: 'Semua data kapal berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// --- AKHIR ROUTE DELETE ---


module.exports = router;