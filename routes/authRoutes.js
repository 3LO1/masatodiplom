const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController'); // Убедись, что правильно импортировал

// Маршрут для регистрации
router.post('/register', register);

// Маршрут для логина
router.post('/login', login);

module.exports = router;