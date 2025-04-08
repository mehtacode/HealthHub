const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// User Signup Route
app.post('/api/users/signup', (req, res) => {
    const { name, email, password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ error: err });
        const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        db.query(sql, [name, email, hash], (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'User registered successfully' });
        });
    });
});

// User Login Route
app.post('/api/users/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(400).json({ error: 'User not found' });

        bcrypt.compare(password, results[0].password, (err, match) => {
            if (!match) return res.status(400).json({ error: 'Incorrect password' });

            const token = jwt.sign({ userId: results[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        });
    });
});

// Add a Doctor Route
app.post('/api/doctors', (req, res) => {
    const { name, specialty, experience, fees } = req.body;
    const sql = 'INSERT INTO doctors (name, specialty, experience, fees) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, specialty, experience, fees], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: 'Doctor added successfully' });
    });
});

// Get Doctors Route
app.get('/api/doctors', (req, res) => {
    const sql = 'SELECT * FROM doctors';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Add a Review Route
app.post('/api/reviews', (req, res) => {
    const { user_id, doctor_id, rating, comment } = req.body;

    if (!user_id || !doctor_id || !rating) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sql = 'INSERT INTO reviews (user_id, doctor_id, rating, comment) VALUES (?, ?, ?, ?)';
    db.query(sql, [user_id, doctor_id, rating, comment], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Review added successfully' });
    });
});

// Get Reviews for a Doctor
app.get('/api/reviews/:doctor_id', (req, res) => {
    const { doctor_id } = req.params;

    const sql = `SELECT users.name AS user_name, reviews.rating, reviews.comment, reviews.created_at 
                 FROM reviews 
                 JOIN users ON reviews.user_id = users.id 
                 WHERE doctor_id = ?`;
    db.query(sql, [doctor_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Default route
app.get('/', (req, res) => {
    res.send('Welcome to the HealthHub API');
});

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
