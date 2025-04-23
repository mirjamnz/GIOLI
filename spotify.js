// spotify.js
const axios = require('axios');
require('dotenv').config();

console.log("Using SPOTIFY_CLIENT_ID:", process.env.SPOTIFY_CLIENT_ID);


// Get an access token using the Client Credentials Flow
async function getAccessToken() {
  try {
    const token = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');

    const res = await axios.post('https://accounts.spotify.com/api/token',
      new URLSearchParams({ grant_type: 'client_credentials' }),
      {
        headers: {
          Authorization: `Basic ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

    return res.data.access_token;
  } catch (err) {
    console.error('Failed to get Spotify access token:', err.message);
    return null;
  }
}

// Get 10 previewable tracks from a playlist
async function getSpotifyQuizTracks(playlistId = '37i9dQZF1DXcZDD7cfEKhW') {
  const token = await getAccessToken();
  if (!token) {
    console.error('No token retrieved. Aborting track request.');
    return [];
  }

  try {
    const res = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        fields: 'items(track(name,artists(name),preview_url,external_urls))',
        limit: 10
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
    if (err.response && err.response.status === 404) {
      console.error('Spotify playlist not found (404). Check if it exists or is public.');
    } else {
      console.error('Error loading Spotify quiz:', err.message);
    }
    return [];
  }
}

module.exports = { getSpotifyQuizTracks };
