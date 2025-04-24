// scripts/populateQuizzes.js
require('dotenv').config();
const db = require('../db');
const { getSpotifyQuizTracks } = require('../spotify');

(async function run() {
  const fakeReq = {
    session: {
      spotifyAccessToken: process.env.TEST_SPOTIFY_ACCESS_TOKEN
    }
  };

  const genre = 'Pop'; // You can modify this or infer dynamically
  const tracks = await getSpotifyQuizTracks(fakeReq);

  tracks.forEach((track) => {
    const query = `
      INSERT INTO quizzes (audio_url, correct_artist, correct_title, genre)
      VALUES (?, ?, ?, ?)
    `;
    db.query(query, [track.preview, track.artist, track.title, genre], (err) => {
      if (err) {
        console.error("❌ Failed to insert track:", track.title, err.message);
      } else {
        console.log(`✅ Inserted: ${track.title} by ${track.artist}`);
      }
    });
  });
})();
