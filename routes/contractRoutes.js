// contractRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../db');

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, r.price AS monthly_price, rm.room_number, 
              r.start_date, r.end_date
       FROM contracts c
       JOIN requests r ON c.request_id = r.id
       JOIN rooms rm ON r.room_id = rm.id
       WHERE c.user_id = $1 
       ORDER BY c.created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting contracts:', err);
    res.status(500).json({ message: 'Error getting contracts' });
  }
});

router.get('/:id/details', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, rm.price AS monthly_price, rm.room_number, 
              r.start_date, r.end_date
       FROM contracts c
       JOIN requests r ON c.request_id = r.id
       JOIN rooms rm ON r.room_id = rm.id
       WHERE c.id = $1 AND c.user_id = $2`,
      [req.params.id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Договор не найден' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting contract details:', err);
    res.status(500).json({ message: 'Ошибка при получении данных договора' });
  }
});

module.exports = router;