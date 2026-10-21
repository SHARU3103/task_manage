const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  exportTasksCsv,
} = require('../controllers/taskController');

// Export CSV route (must be before :id)
router.get('/export', exportTasksCsv);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

// Status update dedicated route
router.put('/:id/status', updateTaskStatus);

module.exports = router;
