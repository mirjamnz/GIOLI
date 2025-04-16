// app.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./db'); // Connect to MySQL

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

// === Set View Engine ===
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// === Routes ===
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user || null });
});

// Sample placeholder for quiz route
const quizRoutes = require('./routes/quiz');
app.use('/quiz', quizRoutes);

const authRoutes = require('./routes/auth');
app.use('/', authRoutes);


// === Start Server ===
const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
