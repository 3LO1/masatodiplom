const pool = require('../db');
const generateContract = require('../utils/generateContract');

exports.createRequest = async (req, res) => {
  const { room_id, start_date, end_date, comment, iin } = req.body;
  const user_id = req.user.userId;

  try {
    const result = await pool.query(
      `INSERT INTO requests (user_id, room_id, start_date, end_date, comment, iin)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, room_id, start_date, end_date, comment, iin]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating request:', err);
    res.status(500).json({ message: 'Error creating request' });
  }
};

exports.getMyRequests = async (req, res) => {
  const user_id = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT r.*, rm.room_number, rm.floor, rm.area, rm.price, rm.type as room_type
       FROM requests r
       JOIN rooms rm ON r.room_id = rm.id
       WHERE r.user_id = $1 ORDER BY r.id DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting requests:', err);
    res.status(500).json({ message: 'Error getting requests' });
  }
};

exports.getAllRequestsForAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.email as user_email, u.full_name as user_full_name,
       rm.room_number, rm.floor, rm.area, rm.price, rm.type as room_type
       FROM requests r
       JOIN users u ON r.user_id = u.id
       JOIN rooms rm ON r.room_id = rm.id
       ORDER BY r.id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting all requests:', err);
    res.status(500).json({ message: 'Error getting all requests' });
  }
};

exports.approveRequest = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Обновляем статус заявки
    await client.query(
      `UPDATE requests SET status = 'approved' WHERE id = $1`,
      [id]
    );

    // Получаем данные заявки
    const requestResult = await client.query(
      `SELECT user_id, room_id FROM requests WHERE id = $1`,
      [id]
    );
    
    if (requestResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Request not found' });
    }

    const { user_id, room_id } = requestResult.rows[0];

    // Обновляем статус комнаты
    await client.query(
      `UPDATE rooms SET status = 'occupied' WHERE id = $1`,
      [room_id]
    );

    // Добавляем уведомление
    await client.query(
      `INSERT INTO notifications (user_id, request_id, message)
       VALUES ($1, $2, 'Ваша заявка была одобрена')`,
      [user_id, id]
    );

    await client.query('COMMIT');
    res.json({ message: 'Request approved successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error approving request:', err);
    res.status(500).json({ message: 'Error approving request' });
  } finally {
    client.release();
  }
};

exports.rejectRequest = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Обновляем статус заявки и получаем данные
    const result = await client.query(
      `UPDATE requests SET status = 'rejected' 
       WHERE id = $1 
       RETURNING user_id, room_id`,
      [id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Request not found' });
    }

    const { user_id, room_id } = result.rows[0];

    // Освобождаем помещение
    await client.query(
      `UPDATE rooms SET status = 'available' WHERE id = $1`,
      [room_id]
    );

    // Добавляем уведомление пользователю
    await client.query(
      `INSERT INTO notifications (user_id, request_id, message)
       VALUES ($1, $2, 'Ваша заявка была отклонена администратором')`,
      [user_id, id]
    );

    await client.query('COMMIT');
    res.json({ message: 'Request rejected, notification sent' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error rejecting request:', err);
    res.status(500).json({ message: 'Error rejecting request' });
  } finally {
    client.release();
  }
};

exports.generateContract = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Получаем данные для договора
    const requestData = await client.query(
      `SELECT r.*, u.full_name, u.email, rm.room_number, rm.floor, rm.area, rm.price, rm.type
       FROM requests r
       JOIN users u ON r.user_id = u.id
       JOIN rooms rm ON r.room_id = rm.id
       WHERE r.id = $1 AND r.status = 'approved'`,
      [id]
    );

    if (requestData.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Request not found or not approved' });
    }

    const data = requestData.rows[0];
    const contractPath = await generateContract(data);

    // Сохраняем договор в базу
    await client.query(
      `INSERT INTO contracts (user_id, request_id, file_url)
       VALUES ($1, $2, $3)`,
      [data.user_id, id, contractPath]
    );

    // Добавляем уведомление
    await client.query(
      `INSERT INTO notifications (user_id, request_id, message)
       VALUES ($1, $2, 'Для вашей заявки сгенерирован договор')`,
      [data.user_id, id]
    );

    await client.query('COMMIT');
    res.json({ 
      message: 'Contract generated successfully',
      contractUrl: contractPath
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error generating contract:', err);
    res.status(500).json({ message: 'Error generating contract' });
  } finally {
    client.release();
  }
};