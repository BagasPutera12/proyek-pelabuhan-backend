// backend/routes/ships.js
const express = require('express');
const Ship = require('../models/Ship'); // Impor model Ship

const router = express.Router();

// === ROUTE 1: GET SEMUA KAPAL ===
// Method: GET
// Endpoint: /api/ships/
router.get('/', async (req, res) => {
  try {
    const shipsWithAvgRating = await Ship.aggregate([
      {
        // 1. Gabungkan collection 'ships' dengan 'ratings'
        $lookup: {
          from: 'ratings', // Nama collection ratings di MongoDB
          localField: '_id',
          foreignField: 'shipId',
          as: 'ratings' // Nama field baru berisi array ratings
        }
      },
      {
        // 2. Tambah field baru 'avgRating'
        $addFields: {
          avgRating: {
            // Hitung rata-rata dari field 'rating' di dalam array 'ratings'
            // Jika tidak ada rating, hasilnya 0
            $ifNull: [{ $avg: '$ratings.rating' }, 0]
          }
        }
      },
      {
        // 3. Hapus field array 'ratings' agar response tidak terlalu besar
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


// === ROUTE 2: MEMBUAT KAPAL BARU ===
// Method: POST
// Endpoint: /api/ships/
router.post('/', async (req, res) => {
  // Mengambil data dari body request
  const { name, photo, description, vessel_finder_url, ticket_url, schedule_info } = req.body;

  try {
    // Membuat dokumen baru di database menggunakan model Ship
    const ship = await Ship.create({ name, photo, description, vessel_finder_url, ticket_url, schedule_info });
    res.status(201).json(ship); // Mengembalikan data yang baru dibuat dengan status 201 (Created)
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


module.exports = router;