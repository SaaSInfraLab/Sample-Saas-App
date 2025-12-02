const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { ensureTenantIsolation } = require('../middleware/tenant-isolation');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStatistics,
} = require('../controllers/taskController');

router.use(authenticateToken);
router.use(ensureTenantIsolation);

router.get('/', getTasks);
router.get('/statistics', getTaskStatistics);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;

