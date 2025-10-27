const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// 🔐 Вход
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Неверные данные для входа' });
    }

    const user = result.rows[0];

    // Сравнение хеша пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверные данные для входа' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`🔐 Вход: ${email}, роль: ${user.role}`);
    res.json({ token, role: user.role, full_name: user.full_name });
  } catch (err) {
    console.error('Ошибка при входе:', err);
    res.status(500).json({ message: 'Ошибка при входе в систему' });
  }
};

// 📝 Регистрация
exports.register = async (req, res) => {
  const { full_name, email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3)',
      [full_name, email, hashedPassword]
    );

    res.status(201).json({ message: 'Пользователь зарегистрирован' });
  } catch (err) {
    console.error('Ошибка при регистрации:', err);
    res.status(500).json({ message: 'Ошибка при регистрации пользователя' });
  }
};
