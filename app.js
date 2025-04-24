
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

// === Session Setup ===
app.use(session({
  secret: 'guessit-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// === View Engine ===
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// === Routes ===
app.use('/', require('./routes/spotifyAuth'));
app.use('/', require('./routes/spotifyQuiz'));
app.use('/admin', require('./routes/admin'));
app.use('/quiz', require('./routes/quiz')); // 💡 Must come after static/JSON middleware
app.use('/', require('./routes/auth'));

// === Home Page ===
app.get('/', (req, res) => {
  db.query("SELECT DISTINCT genre FROM quizzes ORDER BY genre ASC", (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).send("Database error");
    }

    const genres = results.map(row => row.genre);
    res.render('index', {
      user: req.session.user || null,
      genres,
      spotifyAccessToken: req.session.spotifyAccessToken || null
    });
  });
});

// === Start Server ===
const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


