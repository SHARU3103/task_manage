const { isTaskOverdue } = require('./businessRules');

/**
 * Escapes a cell for CSV formatting (RFC 4180)
 */
const escapeCsvCell = (value) => {
  if (value === null || value === undefined) return '""';
  const stringValue = String(value);
  // If value contains comma, quotes, or newline, escape double quotes and wrap in quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return `"${stringValue}"`;
};

/**
 * Formats a Date object to YYYY-MM-DD
 */
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

/**
 * Converts task documents to CSV string
 * @param {Array} tasks - Array of Task documents
 * @returns {string} - CSV formatted string
 */
const tasksToCsv = (tasks) => {
  const headers = [
    'Task ID',
    'Title',
    'Description',
    'Department',
    'Priority',
    'Status',
    'Assigned Employee ID',
    'Assigned Employee Name',
    'Assigned Employee Email',
    'Start Date',
    'Due Date',
    'Completed Date',
    'Overdue',
    'Created At',
  ];

  const rows = tasks.map((task) => {
    const overdue = isTaskOverdue(task) ? 'Yes' : 'No';
    const employeeName =
      (task.assignedEmployee && task.assignedEmployee.fullName) ||
      (task.assignedEmployeeSnapshot && task.assignedEmployeeSnapshot.fullName) ||
      'N/A';
    const employeeId =
      (task.assignedEmployee && task.assignedEmployee.employeeId) ||
      (task.assignedEmployeeSnapshot && task.assignedEmployeeSnapshot.employeeId) ||
      'N/A';
    const employeeEmail =
      (task.assignedEmployee && task.assignedEmployee.email) ||
      (task.assignedEmployeeSnapshot && task.assignedEmployeeSnapshot.email) ||
      'N/A';

    return [
      escapeCsvCell(task.taskId),
      escapeCsvCell(task.title),
      escapeCsvCell(task.description || ''),
      escapeCsvCell(task.department),
      escapeCsvCell(task.priority),
      escapeCsvCell(task.status),
      escapeCsvCell(employeeId),
      escapeCsvCell(employeeName),
      escapeCsvCell(employeeEmail),
      escapeCsvCell(formatDate(task.startDate)),
      escapeCsvCell(formatDate(task.dueDate)),
      escapeCsvCell(formatDate(task.completedDate)),
      escapeCsvCell(overdue),
      escapeCsvCell(formatDate(task.createdDate || task.createdAt)),
    ].join(',');
  });

  return [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
};

module.exports = {
  tasksToCsv,
};
