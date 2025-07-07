// backend/routes/fullSurvey.js (FINAL DENGAN EMAIL DETAIL)

const express = require('express');
const SurveySubmission = require('../models/SurveySubmission');
const AspectRating = require('../models/AspectRating');
const nodemailer = require('nodemailer');
const router = express.Router();

// --- FUNGSI EMAIL YANG DIPERBARUI SECARA TOTAL ---
const sendNotificationEmail = async (submissionData, allRatings) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Variabel email tidak diatur. Melewatkan pengiriman email.');
    return;
  }

  // --- 1. Logika untuk Menghitung Rata-rata ---
  
  // Kelompokkan rating berdasarkan aspek
  const ratingsByAspect = allRatings.reduce((acc, current) => {
    acc[current.aspect] = acc[current.aspect] || [];
    acc[current.aspect].push(current.rating);
    return acc;
  }, {});

  // Hitung rata-rata untuk setiap aspek
  const aspectAverages = Object.entries(ratingsByAspect).map(([aspect, ratings]) => {
    const sum = ratings.reduce((total, r) => total + r, 0);
    return {
      aspect,
      average: (sum / ratings.length).toFixed(2)
    };
  });

  // Hitung rata-rata keseluruhan dari survei ini saja
  const overallAverage = (aspectAverages.reduce((sum, item) => sum + parseFloat(item.average), 0) / aspectAverages.length).toFixed(2);


  // --- 2. Logika untuk Membuat Tampilan HTML Email ---
  
  // Membuat baris tabel untuk setiap rata-rata aspek
  const aspectRows = aspectAverages.map(item => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.aspect}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;"><b>${item.average}</b></td>
    </tr>
  `).join('');

  // Membuat baris tabel untuk setiap jawaban/indikator
  const indicatorRows = allRatings.map(item => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.indicator}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.rating}</td>
    </tr>
  `).join('');

  
  // --- 3. Konfigurasi dan Kirim Email ---

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let mailOptions = {
    from: `"Notifikasi Survei Pelabuhan" <${process.env.EMAIL_USER}>`,
    to: 'bagasanugrahcahyaningsih@gmail.com',
    subject: `[Rating: ${overallAverage}] Survei Baru dari ${submissionData.userName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Masukan Survei Baru Diterima</h2>
        <p>Pengguna <b>${submissionData.userName}</b> (${submissionData.userEmail}) telah mengirimkan survei pada ${new Date(submissionData.createdAt).toLocaleString('id-ID')}.</p>
        
        <h3>Ringkasan Penilaian (Dari Isian Ini)</h3>
        <p><strong>Rata-rata Keseluruhan: ⭐ ${overallAverage} / 5.00</strong></p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead style="background-color: #f2f2f2;">
            <tr>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Aspek Penilaian</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Rata-rata</th>
            </tr>
          </thead>
          <tbody>
            ${aspectRows}
          </tbody>
        </table>
        
        <h3 style="margin-top: 30px;">Saran yang Diberikan:</h3>
        <p style="font-style: italic; border-left: 4px solid #ccc; padding-left: 15px;">
          ${submissionData.suggestion || 'Tidak ada saran yang diberikan.'}
        </p>
        
        <hr style="margin: 30px 0;">

        <h3>Rincian Jawaban per Indikator</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead style="background-color: #f2f2f2;">
            <tr>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Indikator Penilaian</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Rating</th>
            </tr>
          </thead>
          <tbody>
            ${indicatorRows}
          </tbody>
        </table>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email notifikasi detail berhasil dikirim.');
  } catch (error) {
    console.error('Gagal mengirim email notifikasi detail:', error);
  }
};

router.post('/', async (req, res) => {
  try {
    const { userName, userEmail, ratings, suggestion } = req.body;
    if (!userName || !userEmail || !ratings || !Array.isArray(ratings)) {
      return res.status(400).json({ error: 'Data tidak lengkap.' });
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
    
    // Panggil fungsi kirim email dengan data yang lebih lengkap
    sendNotificationEmail(savedSubmission, ratings);

    res.status(201).json({ message: 'Terima kasih! Survei dan masukan Anda telah berhasil dikirimkan.' });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;