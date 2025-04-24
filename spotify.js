const axios = require('axios');
require('dotenv').config();

async function getSpotifyQuizTracks(req, playlistId = '5lPrYLdwKn8Y1jqnExBip9') {
  const token = req.session.spotifyAccessToken;
  if (!token) {
    console.error('❌ Spotify token missing. User must log in via /login-spotify');
    return [];
  }

  const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

  try {
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        limit: 50, // Adjust as needed
      }
    });

    return res.data.items
      .filter(item => item.track && item.track.preview_url)
      .map(item => ({
        title: item.track.name,
        artist: item.track.artists.map(a => a.name).join(', '),
        preview: item.track.preview_url,
        link: item.track.external_urls.spotify
      }));
  } catch (err) {
    console.error('❌ Error loading Spotify playlist:', err.response?.data || err.message);
    return [];
  }
}

module.exports = { getSpotifyQuizTracks };
