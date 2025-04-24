// routes/spotifyAuth.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

router.get('/login-spotify', (req, res) => {
  const authUrl = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
    response_type: 'code',
    client_id,
    scope: 'playlist-read-private playlist-read-collaborative',
    redirect_uri
  });

  res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send('Missing code');

  try {
    const tokenRes = await axios.post('https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        client_id,
        client_secret
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

    req.session.spotifyAccessToken = tokenRes.data.access_token;
    console.log('✅ Spotify access token received');

    res.redirect('/spotify-quiz');
  } catch (err) {
    console.error('❌ Failed to exchange code:', err.response?.data || err.message);
    res.send('Error retrieving access token');
  }
});

module.exports = router;
