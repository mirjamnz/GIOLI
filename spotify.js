const axios = require('axios');
require('dotenv').config();

console.log("Using SPOTIFY_CLIENT_ID:", process.env.SPOTIFY_CLIENT_ID);

// ✅ Load tracks from a Spotify playlist using session token
async function getSpotifyQuizTracks(req, playlistId = '5lPrYLdwKn8Y1jqnExBip9') {
  const token = req.session.spotifyAccessToken;
  if (!token) {
    console.error('❌ Spotify token missing. User must log in via /login-spotify');
    return [];
  }

  console.log('🟢 Using token:', token.slice(0, 20) + '...');

  const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

  try {
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        limit: 10
      }
    });

    console.log("🎧 Raw Spotify response:", JSON.stringify(res.data, null, 2));
    console.log('🎧 Preview URL:', item.track.preview_url);

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
