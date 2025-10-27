const pool = require('../db');

exports.getAllRooms = async (req, res) => {
  const { status } = req.query;

  try {
    let query = `
      SELECT r.*, 
             req.start_date, req.end_date,
             u.full_name AS tenant_name, u.email AS tenant_email
      FROM rooms r
      LEFT JOIN requests req ON r.id = req.room_id AND req.status = 'approved'
      LEFT JOIN users u ON req.user_id = u.id
    `;
    let params = [];

    if (status === 'available' || status === 'occupied') {
      query += ' WHERE r.status = $1';
      params.push(status);
    }

    const result = await pool.query(query, params);
    
    // Проверяем и обновляем статус комнат, если срок аренды истек
    const today = new Date().toISOString().split('T')[0];
    for (const room of result.rows) {
      if (room.status === 'occupied' && room.end_date && room.end_date < today) {
        await pool.query('UPDATE rooms SET status = $1 WHERE id = $2', ['available', room.id]);
        room.status = 'available';
      }
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при загрузке помещений:', err);
    res.status(500).json({ message: 'Ошибка при загрузке' });
  }
};

exports.createRoom = async (req, res) => {
  const { room_number, floor, area, price, type, photo_url } = req.body;
  
  if (!room_number || !floor || !area || !price || !type) {
    return res.status(400).json({ message: 'Все обязательные поля должны быть заполнены' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO rooms 
       (room_number, floor, area, price, type, status, photo_url) 
       VALUES ($1, $2, $3, $4, $5, 'available', $6) 
       RETURNING *`,
      [room_number, floor, area, price, type, photo_url || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при создании помещения:', err);
    
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Помещение с таким номером уже существует' });
    }
    
    res.status(500).json({ message: 'Ошибка при создании помещения' });
  }
};

exports.updateRoom = async (req, res) => {
  const { id } = req.params;
  const { room_number, floor, area, price, type, photo_url } = req.body;

  try {
    const result = await pool.query(
      `UPDATE rooms 
       SET room_number = $1, floor = $2, area = $3, price = $4, type = $5, photo_url = $6
       WHERE id = $7
       RETURNING *`,
      [room_number, floor, area, price, type, photo_url || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Помещение не найдено' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при обновлении помещения:', err);
    res.status(500).json({ message: 'Ошибка при обновлении помещения' });
  }
};

exports.deleteRoom = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM rooms 
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Помещение не найдено' });
    }

    res.json({ message: 'Помещение успешно удалено' });
  } catch (err) {
    console.error('Ошибка при удалении помещения:', err);
    res.status(500).json({ message: 'Ошибка при удалении помещения' });
  }
};