const express = require('express');
const router = express.Router();
const db = require('../db'); // подключение к базе
const generateContract = require('../utils/generateContract');

// Подтвердить заявку и сгенерировать договор
router.post('/approve-request/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const requestRes = await db.query('SELECT * FROM requests WHERE id = $1', [id]);
    if (requestRes.rows.length === 0) return res.status(404).json({ message: 'Заявка не найдена' });

    const request = requestRes.rows[0];

    const userRes = await db.query('SELECT * FROM users WHERE id = $1', [request.user_id]);
    if (userRes.rows.length === 0) return res.status(404).json({ message: 'Пользователь не найден' });

    const user = userRes.rows[0];

    // Генерация договора
    const contractPath = await generateContract(user, request);

    // Сохраняем договор в базу
    await db.query(
      'INSERT INTO contracts (user_id, request_id, file_url) VALUES ($1, $2, $3)',
      [user.id, request.id, contractPath]
    );

    // Обновляем статус заявки
    await db.query(
      'UPDATE requests SET status = $1 WHERE id = $2',
      ['approved', id]
    );

    res.json({ message: 'Заявка подтверждена. Договор создан.', contractUrl: contractPath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при подтверждении заявки' });
  }
});

module.exports = router;