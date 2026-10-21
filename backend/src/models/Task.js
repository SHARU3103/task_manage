const mongoose = require('mongoose');
const { DEPARTMENTS } = require('./Employee');

const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const TASK_STATUSES = ['Todo', 'In Progress', 'Completed', 'Cancelled'];

const taskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: [true, 'Task ID is required'],
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Assigned Employee is required'],
    },
    // Snapshot ensures meaningful details are preserved even if employee is deleted
    assignedEmployeeSnapshot: {
      employeeId: { type: String, default: '' },
      fullName: { type: String, default: '' },
      email: { type: String, default: '' },
      role: { type: String, default: '' },
      department: { type: String, default: '' },
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: {
        values: DEPARTMENTS,
        message: '{VALUE} is not a valid department',
      },
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: TASK_PRIORITIES,
        message: '{VALUE} is not a valid priority',
      },
      default: 'Medium',
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: TASK_STATUSES,
        message: '{VALUE} is not a valid status',
      },
      default: 'Todo',
    },
    startDate: {
      type: Date,
      required: [true, 'Start Date is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due Date is required'],
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    completedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to determine if task is overdue
taskSchema.virtual('isOverdue').get(function () {
  if (this.status === 'Completed' || this.status === 'Cancelled') {
    return false;
  }
  if (!this.dueDate) return false;
  // Normalize today and dueDate to date only (end of due date) or compare timestamps
  const now = new Date();
  const due = new Date(this.dueDate);
  // Compare end of due date (or simple now > due)
  return now > due;
});

// Priority ranking helper for sorting
const PRIORITY_ORDER = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

taskSchema.index({ title: 'text', description: 'text' });
taskSchema.index({ status: 1 });
taskSchema.index({ assignedEmployee: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ department: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = {
  Task,
  TASK_PRIORITIES,
  TASK_STATUSES,
  PRIORITY_ORDER,
};
