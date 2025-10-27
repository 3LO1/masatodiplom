const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Создание платежа
router.post('/', authMiddleware, paymentController.createPayment);

// Получение платежей пользователя
router.get('/', authMiddleware, paymentController.getUserPayments);

// Получение статистики (для администратора)
router.get('/stats', authMiddleware, adminMiddleware, paymentController.getPaymentStats);

module.exports = router;
