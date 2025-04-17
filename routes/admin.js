const express = require('express');
const router = express.Router();
const db = require('../db'); // Correct relative path

// GET /admin → Show Admin Panel
router.get('/', (req, res) => {
  const user = req.session.user;

  if (!user || user.role !== 'admin') {
    return res.status(403).send("Access denied.");
  }

  db.query("SELECT * FROM quizzes ORDER BY id DESC", (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).send("Database error");
    }

    res.render('admin', { quizzes: results });
  });
});

// POST /admin/add → Add new quiz
router.post('/add', (req, res) => {
  const user = req.session.user;

  if (!user || user.role !== 'admin') {
    return res.status(403).send("Access denied.");
  }

  const { audio_url, correct_artist, correct_title, genre } = req.body;

  const query = `
    INSERT INTO quizzes (audio_url, correct_artist, correct_title, genre)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [audio_url, correct_artist, correct_title, genre], (err) => {
    if (err) {
      console.error("Failed to insert quiz:", err);
      return res.status(500).send("Failed to add quiz.");
    }

    res.redirect('/admin');
  });
});

module.exports = router;
