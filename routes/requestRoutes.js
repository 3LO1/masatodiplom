const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const requestController = require('../controllers/requestController');

// Подать заявку
router.post('/', authMiddleware, requestController.createRequest);

// Получить свои заявки
router.get('/', authMiddleware, requestController.getMyRequests);

// Получить все заявки (админ)
router.get('/all', authMiddleware, adminMiddleware, requestController.getAllRequestsForAdmin);

// Одобрить заявку (админ)
router.post('/:id/approve', authMiddleware, adminMiddleware, requestController.approveRequest);

// Отклонить заявку (админ)
router.post('/:id/reject', authMiddleware, adminMiddleware, requestController.rejectRequest);

router.post(
  '/:id/generate-contract',
  authMiddleware,
  adminMiddleware,
  requestController.generateContract
);

module.exports = router;