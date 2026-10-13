const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/', activityController.getActivities);
router.post('/', activityController.createActivity);
router.get('/:id', activityController.getActivityById);
router.put('/:id', activityController.updateActivity);
router.patch('/:id/status', activityController.updateActivityStatus);
router.delete('/:id', activityController.deleteActivity);

module.exports = router;
