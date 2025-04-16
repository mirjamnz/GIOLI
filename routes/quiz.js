const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /quiz/:genre → get random quiz from that genre
router.get('/:genre', (req, res) => {
  const genre = req.params.genre;
  const query = `
    SELECT * FROM quizzes
    WHERE genre = ?
    ORDER BY RAND()
    LIMIT 1
  `;

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

// POST /quiz/submit → grade the quiz
router.post('/submit', (req, res) => {
  const { quiz_id, artist, title, genre } = req.body;

  const query = `SELECT * FROM quizzes WHERE id = ? LIMIT 1`;

  db.query(query, [quiz_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).send("Error loading quiz.");
    }

    const quiz = results[0];

    const userArtist = artist.trim().toLowerCase();
    const userTitle = title.trim().toLowerCase();
    const userGenre = genre.trim().toLowerCase();

    const correctArtist = quiz.correct_artist.trim().toLowerCase();
    const correctTitle = quiz.correct_title.trim().toLowerCase();
    const correctGenre = quiz.genre.trim().toLowerCase();

    const artistCorrect = userArtist === correctArtist;
    const titleCorrect = userTitle === correctTitle;
    const genreCorrect = userGenre === correctGenre;

    let score = 0;
    if (artistCorrect) score += 10;
    if (titleCorrect) score += 10;
    if (genreCorrect) score += 5;

    const user = req.session.user;
    if (user && user.id) {
      const insert = `INSERT INTO scores (user_id, quiz_id, points) VALUES (?, ?, ?)`;
      db.query(insert, [user.id, quiz.id, score], (err) => {
        if (err) console.error("Error saving score:", err.message);
      });
    }

    res.render('results', {
      userAnswer: {
        artist,
        title,
        genre,
        artistCorrect,
        titleCorrect,
        genreCorrect,
        score
      },
      correct: {
        artist: quiz.correct_artist,
        title: quiz.correct_title,
        genre: quiz.genre
      }
    });
  });
});

module.exports = router;
