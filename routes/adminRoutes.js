const express         = require('express');
const router          = express.Router();
const authMiddleware  = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

// Получить все заявки (только для админа)
router.get(
  '/requests',
  authMiddleware,
  adminMiddleware,
  adminController.getAllRequests
);

// Одобрить заявку по ID
router.post(
  '/requests/:id/approve',
  authMiddleware,
  adminMiddleware,
  adminController.approveRequest
);

// Отклонить заявку по ID
router.post(
  '/requests/:id/reject',
  authMiddleware,
  adminMiddleware,
  adminController.rejectRequest
);

// Сгенерировать отчет для налоговой
router.post(
  '/generate-tax-report',
  authMiddleware,
  adminMiddleware,
  adminController.generateTaxReport
);

module.exports = router;