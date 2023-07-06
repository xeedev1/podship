const express = require('express');
const router = express.Router();
const pool = require('./db');

router.get('/api/data', (req, res) => {
  pool.query('SELECT * FROM db', (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Error retrieving data' });
    } else {
      res.json(results);
    }
  });
});

module.exports = router; // Export the router instance
