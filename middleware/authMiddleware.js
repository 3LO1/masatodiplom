// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('⛔ Отсутствует или некорректный токен авторизации');
    return res.status(401).json({ message: 'Нет токена авторизации' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      console.warn('⛔ Токен не содержит userId');
      return res.status(401).json({ message: 'Недействительный токен' });
    }

    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    console.error('❌ Ошибка проверки токена:', err.message);
    res.status(401).json({ message: 'Неверный токен' });
  }
};
