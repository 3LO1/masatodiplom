const pool = require('../db');

exports.createPayment = async (req, res) => {
  const { request_id, amount } = req.body;
  const user_id = req.user.userId;

  try {
    // Проверяем, что заявка принадлежит пользователю
    const requestCheck = await pool.query(
      `SELECT id, room_id FROM requests WHERE id = $1 AND user_id = $2`,
      [request_id, user_id]
    );
    
    if (requestCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Недостаточно прав для выполнения операции' });
    }

    // Получаем данные о комнате для проверки цены
    const roomCheck = await pool.query(
      `SELECT price FROM rooms WHERE id = $1`,
      [requestCheck.rows[0].room_id]
    );

    if (roomCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Помещение не найдено' });
    }

    // Проверяем, что сумма платежа положительная
    if (amount <= 0) {
      return res.status(400).json({ message: 'Сумма платежа должна быть положительной' });
    }

    // Создаем платеж
    await pool.query(
      'INSERT INTO payments (request_id, amount) VALUES ($1, $2)',
      [request_id, amount]
    );

    res.status(201).json({ message: 'Платеж успешно проведен' });
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).json({ message: 'Ошибка при обработке платежа' });
  }
};

exports.getUserPayments = async (req, res) => {
  const user_id = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT p.*, r.room_id, rm.room_number
       FROM payments p
       JOIN requests r ON p.request_id = r.id
       JOIN rooms rm ON r.room_id = rm.id
       WHERE r.user_id = $1
       ORDER BY p.payment_date DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting user payments:', err);
    res.status(500).json({ message: 'Ошибка при получении платежей' });
  }
};

exports.getPaymentStats = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }

  try {
    const yearlyStats = await pool.query(`
      SELECT 
        EXTRACT(YEAR FROM payment_date)::integer AS year,
        COUNT(*)::integer AS count,
        COALESCE(SUM(amount)::float, 0) AS total_amount
      FROM payments
      WHERE payment_date IS NOT NULL
      GROUP BY year
      ORDER BY year
    `);

    const roomPopularity = await pool.query(`
      SELECT 
        r.room_number,
        r.type,
        COUNT(rq.id)::integer AS rental_count,
        COALESCE(SUM(p.amount)::float, 0) AS total_revenue
      FROM requests rq
      JOIN rooms r ON rq.room_id = r.id
      LEFT JOIN payments p ON p.request_id = rq.id
      WHERE rq.status = 'approved'
      GROUP BY r.room_number, r.type
      ORDER BY rental_count DESC
    `);

    res.json({
      yearlyStats: yearlyStats.rows,
      roomPopularity: roomPopularity.rows
    });
  } catch (err) {
    console.error('Error fetching payment stats:', err);
    res.status(500).json({ message: 'Ошибка при получении статистики' });
  }
};
