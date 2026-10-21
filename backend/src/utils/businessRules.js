const { Employee } = require('../models/Employee');
const { Task } = require('../models/Task');

// Valid status transitions
const VALID_TRANSITIONS = {
  Todo: ['In Progress', 'Cancelled'],
  'In Progress': ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

/**
 * Validates if a status transition is allowed
 */
const isValidStatusTransition = (currentStatus, newStatus) => {
  if (!VALID_TRANSITIONS[currentStatus]) return false;
  return VALID_TRANSITIONS[currentStatus].includes(newStatus);
};

/**
 * Normalizes a date to start of day (midnight UTC)
 */
const toStartOfDay = (dateInput) => {
  const d = new Date(dateInput);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * Normalizes a date to end of day (23:59:59.999 UTC)
 */
const toEndOfDay = (dateInput) => {
  const d = new Date(dateInput);
  d.setUTCHours(23, 59, 59, 999);
  return d;
};

/**
 * Validates assignment of a task to an employee
 * @param {Object} employee - Mongoose Employee doc
 * @param {Date|string} taskStartDate - Start date of the task
 */
const validateEmployeeAssignment = (employee, taskStartDate) => {
  if (!employee || employee.isDeleted) {
    return {
      valid: false,
      message: 'Assigned employee was not found or is deleted.',
    };
  }

  // Rule: Inactive employee is always rejected
  if (employee.status === 'Inactive') {
    return {
      valid: false,
      message: 'Cannot assign task to an Inactive employee.',
    };
  }

  // Rule: On Leave employee rejected only if task Start Date falls inside leave period (both inclusive)
  if (employee.status === 'On Leave') {
    if (!employee.leaveStartDate || !employee.leaveEndDate) {
      return {
        valid: false,
        message: 'Employee is marked On Leave but leave dates are missing.',
      };
    }

    const taskStart = toStartOfDay(taskStartDate);
    const leaveStart = toStartOfDay(employee.leaveStartDate);
    const leaveEnd = toEndOfDay(employee.leaveEndDate);

    if (taskStart >= leaveStart && taskStart <= leaveEnd) {
      return {
        valid: false,
        message: `Cannot assign task: employee is On Leave from ${leaveStart.toISOString().split('T')[0]} to ${leaveEnd.toISOString().split('T')[0]}, which overlaps with task start date.`,
      };
    }
  }

  return { valid: true };
};

/**
 * Checks employee active tasks capacity (maximum 3 active tasks: Todo + In Progress)
 * @param {string|ObjectId} employeeId - Employee MongoDB _id
 * @param {string|ObjectId} excludeTaskId - Task ID to exclude (when editing existing task)
 */
const checkEmployeeCapacity = async (employeeId, excludeTaskId = null) => {
  const filter = {
    assignedEmployee: employeeId,
    status: { $in: ['Todo', 'In Progress'] },
  };

  if (excludeTaskId) {
    filter._id = { $ne: excludeTaskId };
  }

  const activeCount = await Task.countDocuments(filter);
  if (activeCount >= 3) {
    return {
      allowed: false,
      activeCount,
      message: 'Employee already has 3 active tasks. Please choose another employee.',
    };
  }

  return {
    allowed: true,
    activeCount,
  };
};

/**
 * Validates start and due date relationship
 */
const validateTaskDates = (startDate, dueDate) => {
  const start = toStartOfDay(startDate);
  const due = toStartOfDay(dueDate);

  if (isNaN(start.getTime()) || isNaN(due.getTime())) {
    return {
      valid: false,
      message: 'Invalid Start Date or Due Date provided.',
    };
  }

  if (due < start) {
    return {
      valid: false,
      message: 'Due Date cannot be earlier than Start Date.',
    };
  }

  return { valid: true };
};

/**
 * Helper to determine if a task is overdue
 */
const isTaskOverdue = (task) => {
  if (task.status === 'Completed' || task.status === 'Cancelled') {
    return false;
  }
  if (!task.dueDate) return false;
  const now = new Date();
  const due = new Date(task.dueDate);
  return now > due;
};

module.exports = {
  VALID_TRANSITIONS,
  isValidStatusTransition,
  validateEmployeeAssignment,
  checkEmployeeCapacity,
  validateTaskDates,
  isTaskOverdue,
  toStartOfDay,
  toEndOfDay,
};
