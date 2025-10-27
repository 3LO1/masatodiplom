const pool = require('../db');
const generateTaxReport = require('../utils/generateTaxReport');

exports.getAllRequests = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }
  try {
    const { rows } = await pool.query(`
      SELECT rr.*,
             u.email      AS user_email,
             u.full_name  AS user_full_name,
             r.number     AS room_number,
             r.floor, r.area, r.price,
             r.type       AS room_type
      FROM requests rr
      JOIN users u  ON rr.user_id = u.id
      JOIN rooms r  ON rr.room_id = r.id
      ORDER BY rr.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Ошибка при получении заявок:', err);
    res.status(500).json({ message: 'Ошибка при получении заявок' });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE requests SET status='approved' WHERE id=$1`,
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ message: 'Заявка не найдена' });
    res.json({ message: 'Заявка одобрена' });
  } catch (err) {
    console.error('Ошибка при одобрении заявки:', err);
    res.status(500).json({ message: 'Ошибка при одобрении заявки' });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE requests SET status='rejected' WHERE id=$1`,
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ message: 'Заявка не найдена' });
    res.json({ message: 'Заявка отклонена' });
  } catch (err) {
    console.error('Ошибка при отклонении заявки:', err);
    res.status(500).json({ message: 'Ошибка при отклонении заявки' });
  }
};

exports.generateTaxReport = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }
  
  try {
    const { rows } = await pool.query(`
      SELECT 
        u.full_name, 
        r.iin,
        rm.room_number, 
        rm.area, 
        rm.price
      FROM requests r
      JOIN users u ON r.user_id = u.id
      JOIN rooms rm ON r.room_id = rm.id
      WHERE r.status = 'approved'
      AND (r.end_date IS NULL OR r.end_date >= CURRENT_DATE)
    `);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Нет данных об арендаторах' });
    }

    const reportPath = await generateTaxReport(rows);

    await pool.query(
      `INSERT INTO tax_reports (file_url, generated_by) 
       VALUES ($1, $2)`,
      [reportPath, req.user.userId]
    );

    res.json({ 
      message: 'Отчет для налоговой успешно сгенерирован',
      reportUrl: reportPath
    });
  } catch (err) {
    console.error('Ошибка при генерации отчета:', err);
    res.status(500).json({ message: 'Ошибка при генерации отчета' });
  }
};