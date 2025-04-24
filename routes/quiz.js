
const express = require('express');
const https = require('https');
const router = express.Router();
const db = require('../db');
const { URL } = require('url');

// ✅ Stream Spotify preview audio via proxy
router.get('/proxy-audio', (req, res) => {
  try {
    const fileUrl = req.query.url;

    if (!fileUrl || !fileUrl.startsWith('https://p.scdn.co/')) {
      return res.status(400).send('Invalid or missing Spotify preview URL.');
    }

    const parsedUrl = new URL(fileUrl);

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': '*/*',
        'Accept-Encoding': 'identity'
      }
    };

    https.get(options, (streamRes) => {
      if (streamRes.statusCode !== 200) {
        console.error('Spotify stream error code:', streamRes.statusCode);
        return res.status(502).send('Failed to stream preview from Spotify.');
      }

      res.setHeader('Content-Type', 'audio/mpeg');
      streamRes.pipe(res);
    }).on('error', (err) => {
      console.error('❌ Error proxying audio:', err.message);
      res.status(500).send('Internal error streaming preview.');
    });

  } catch (err) {
    console.error('❌ Proxy error:', err.message);
    res.status(500).send('Unexpected server error.');
  }
});

// ✅ Load quiz by genre
router.get('/:genre', (req, res) => {
  const genre = req.params.genre;
  const query = `SELECT * FROM quizzes WHERE LOWER(genre) = LOWER(?) ORDER BY RAND() LIMIT 1`;

  db.query(query, [genre], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).send("Database error");
    }

    if (results.length === 0) {
      return res.status(404).send("No quiz found for this genre.");
    }

    res.render('quiz', { quiz: results[0] });
  });
});

module.exports = router;