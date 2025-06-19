// middleware/auth.js
const requireAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === process.env.API_KEY) {
    next();
  } else {
    res.status(401).json({ error: 'Akses ditolak. API Key tidak valid atau tidak ada.' });
  }
};
module.exports = requireAuth;