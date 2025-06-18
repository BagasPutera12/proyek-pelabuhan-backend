// backend/routes/ships.js

const express = require('express');
const Ship = require('../models/Ship');
const Rating = require('../models/Rating'); // <-- Pastikan model Rating diimpor

const router = express.Router();

// === ROUTE 1: GET SEMUA KAPAL (DENGAN RATA-RATA RATING) ===
// Method: GET
// Endpoint: /api/ships/
router.get('/', async (req, res) => {
  try {
    const shipsWithAvgRating = await Ship.aggregate([
      {
        $lookup: {
          from: 'ratings',
          localField: '_id',
          foreignField: 'shipId',
          as: 'ratings'
        }
      },
      {
        $addFields: {
          avgRating: {
            $ifNull: [{ $avg: '$ratings.rating' }, 0]
          }
        }
      },
      {
        $project: {
          ratings: 0
        }
      }
    ]);
    res.status(200).json(shipsWithAvgRating);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === ROUTE BARU: GET SATU KAPAL BERDASARKAN ID BESERTA SEMUA RATINGNYA ===
// Method: GET
// Endpoint: /api/ships/ID_KAPALNYA
router.get('/:id', async (req, res) => {
  try {
    // 1. Ambil ID dari parameter URL
    const shipId = req.params.id;

    // 2. Cari kapal berdasarkan ID tersebut
    const ship = await Ship.findById(shipId);

    // Jika kapal tidak ditemukan, kirim error 404
    if (!ship) {
      return res.status(404).json({ error: 'Kapal tidak ditemukan.' });
    }

    // 3. Cari semua rating yang berhubungan dengan kapal ini, urutkan dari terbaru
    const ratings = await Rating.find({ shipId: shipId }).sort({ createdAt: -1 });

    // 4. Kirimkan data gabungan (detail kapal + semua ratingnya)
    res.status(200).json({ ship, ratings });

  } catch (error) {
    // Tangani kemungkinan error ID yang tidak valid
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ error: 'ID Kapal tidak valid.' });
    }
    res.status(500).json({ error: error.message });
  }
});

// === ROUTE 3: MEMBUAT KAPAL BARU ===
// Method: POST
// Endpoint: /api/ships/
router.post('/', async (req, res) => {
  try {
    // Ambil semua data baru dari body request
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
module.exports = router;
