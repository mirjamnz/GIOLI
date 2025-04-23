// app.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./db');

const app = express();

// === Middleware ===
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Session Setup (must be before any routes)
app.use(session({
  secret: 'guessit-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// === Set View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// === Routes (loaded after session middleware)
const spotifyQuizRoutes = require('./routes/spotifyQuiz');
app.use('/spotify-quiz', spotifyQuizRoutes);

const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

const quizRoutes = require('./routes/quiz');
app.use('/quiz', quizRoutes);

const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

// === Home Page
app.get('/', (req, res) => {
  db.query("SELECT DISTINCT genre FROM quizzes ORDER BY genre ASC", (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).send("Database error");
    }

    const genres = results.map(row => row.genre);
    res.render('index', {
      user: req.session.user || null,
      genres
    });
  });
});

// === Start Server
const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
