const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/authMiddleware');

// Получение информации о текущем пользователе
router.get('/info', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name FROM users WHERE id = $1', 
      [req.user.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения данных пользователя' });
  }
});

// Получение данных конкретного пользователя
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, email, full_name FROM users WHERE id = $1', 
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения данных пользователя' });
  }
});

module.exports = router;
