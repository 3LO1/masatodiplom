const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Подключение маршрутов
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/contracts', require('./routes/contractRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));


// Статические файлы
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Проверка подключения
pool.connect()
  .then(() => {
    console.log('✅ Connected to PostgreSQL');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ PostgreSQL connection failed:', err));

module.exports = { pool };