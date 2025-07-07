// backend/routes/fullSurvey.js (FINAL DENGAN NOTIFIKASI EMAIL)

const express = require('express');
const SurveySubmission = require('../models/SurveySubmission');
const AspectRating = require('../models/AspectRating');
const nodemailer = require('nodemailer'); // 1. Impor nodemailer
const router = express.Router();

// 2. Fungsi terpisah untuk mengirim email notifikasi
const sendNotificationEmail = async (submissionData) => {
  // Pastikan variabel email ada sebelum mencoba mengirim
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Variabel email tidak diatur. Melewatkan pengiriman email.');
    return;
  }

  // Konfigurasi "kurir" email menggunakan Gmail
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Email Anda dari Env Variables
      pass: process.env.EMAIL_PASS, // App Password 16 karakter dari Env Variables
    },
  });

  // Siapkan isi email
  let mailOptions = {
    from: `"Notifikasi Survei Pelabuhan" <${process.env.EMAIL_USER}>`,
    to: 'bagasanugrahcahyaningsih@gmail.com', // Email admin tujuan
    subject: `[Notifikasi] Masukan Survei Baru dari ${submissionData.userName}`,
    html: `
      <h2>Masukan Survei Baru Diterima</h2>
      <p>Seorang pengguna telah menyelesaikan survei kepuasan fasilitas pelabuhan pada ${new Date(submissionData.createdAt).toLocaleString('id-ID')}.</p>
      <hr>
      <h3>Detail Pengirim:</h3>
      <ul>
        <li><b>Nama:</b> ${submissionData.userName}</li>
        <li><b>Email:</b> ${submissionData.userEmail}</li>
      </ul>
      <h3>Saran yang Diberikan:</h3>
      <p style="font-style: italic; border-left: 4px solid #ccc; padding-left: 15px;">
        ${submissionData.suggestion || 'Tidak ada saran yang diberikan.'}
      </p>
      <hr>
      <p>Silakan periksa dashboard atau database Anda untuk melihat rincian rating yang diberikan.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email notifikasi berhasil dikirim.');
  } catch (error) {
    // Jika email gagal terkirim, cukup catat di log tanpa membuat request utama gagal
    console.error('Gagal mengirim email notifikasi:', error);
  }
};

// Endpoint untuk menerima data survei (POST)
router.post('/', async (req, res) => {
  try {
    const { userName, userEmail, ratings, suggestion } = req.body;
    if (!userName || !userEmail || !ratings || !Array.isArray(ratings)) {
      return res.status(400).json({ error: 'Data tidak lengkap. Nama, email, dan rating wajib diisi.' });
    }

    const newSubmission = new SurveySubmission({ userName, userEmail, suggestion });
    const savedSubmission = await newSubmission.save();
    const submissionId = savedSubmission._id;

    const ratingsToInsert = ratings.map(r => ({
      submissionId: submissionId,
      aspect: r.aspect,
      indicator: r.indicator,
      rating: r.rating
    }));

    await AspectRating.insertMany(ratingsToInsert);

    // 3. Panggil fungsi kirim email setelah data berhasil disimpan ke database
    sendNotificationEmail(savedSubmission);

    res.status(201).json({ message: 'Terima kasih! Survei dan masukan Anda telah berhasil dikirimkan.' });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;