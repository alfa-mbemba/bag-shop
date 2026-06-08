const express = require('express');
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bag_shop'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('❌ Database error:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL database');
    
    // Create table
    const createTable = `
        CREATE TABLE IF NOT EXISTS bag_interests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            quantity INT NOT NULL,
            message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    db.query(createTable, (err) => {
        if (err) console.error('Error creating table:', err);
        else console.log('✅ Table ready: bag_interests');
    });
});

// API endpoint
app.post('/api/submit-interest', (req, res) => {
    const { name, email, phone, quantity, message } = req.body;
    
    if (!name || !email || !phone || !quantity) {
        return res.status(400).json({ message: 'Please fill all required fields' });
    }
    
    const query = `INSERT INTO bag_interests (name, email, phone, quantity, message)
                   VALUES (?, ?, ?, ?, ?)`;
    
    db.query(query, [name, email, phone, quantity, message || null], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error' });
        }
        res.json({ message: 'Thank you! We will contact you within 24 hours.' });
    });
});

// Get all interests
app.get('/api/interests', (req, res) => {
    db.query('SELECT * FROM bag_interests ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(results);
    });
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// MUHIMU: Tumia '0.0.0.0' kwa Railway
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});