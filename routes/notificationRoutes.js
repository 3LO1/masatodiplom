const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../db');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting notifications:', err);
    res.status(500).json({ message: 'Error getting notifications' });
  }
});

router.post('/:id/read', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error updating notification:', err);
    res.status(500).json({ message: 'Error updating notification' });
  }
});

module.exports = router;