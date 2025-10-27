const express = require('express');
const router = express.Router();
const { 
  getAllRooms, 
  createRoom, 
  updateRoom, 
  deleteRoom 
} = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Получение всех помещений
router.get('/', getAllRooms);

// Создание нового помещения (только для администратора)
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  createRoom
);

// Обновление помещения (только для администратора)
router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  updateRoom
);

// Удаление помещения (только для администратора)
router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  deleteRoom
);

module.exports = router;