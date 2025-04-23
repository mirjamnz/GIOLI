// routes/spotifyQuiz.js
const express = require('express');
const router = express.Router();
const { getSpotifyQuizTracks } = require('../spotify');

router.get('/', async (req, res) => {
  try {
    const tracks = await getSpotifyQuizTracks();
    res.render('spotify-quiz', { tracks });
  } catch (err) {
    console.error('Error loading Spotify quiz:', err);
    res.status(500).send('Spotify quiz error');
  }
});

module.exports = router;
