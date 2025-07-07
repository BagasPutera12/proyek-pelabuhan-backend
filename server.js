require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const shipRoutes = require('./routes/ships');
const ratingRoutes = require('./routes/ratings');
const portSurveyRoutes = require('./routes/portSurveys');
const aspectRatingRoutes = require('./routes/aspectRatings'); 
const fullSurveyRoutes = require('./routes/fullSurvey');

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI tidak ditemukan.');
  process.exit(1);
}

app.use('/api/ships', shipRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/aspect-ratings', aspectRatingRoutes);
app.use('/api/full-surveys', fullSurveyRoutes);
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Berhasil terhubung ke MongoDB Atlas!');
    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di port: ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Gagal terhubung ke database:', error);
    process.exit(1);
  }
};

startServer();