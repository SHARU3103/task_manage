const { Task, TASK_PRIORITIES, TASK_STATUSES, PRIORITY_ORDER } = require('../models/Task');
const { Employee } = require('../models/Employee');
const { getNextSequence } = require('../models/Counter');
const {
  isValidStatusTransition,
  validateEmployeeAssignment,
  checkEmployeeCapacity,
  validateTaskDates,
  isTaskOverdue,
  VALID_TRANSITIONS,
  toStartOfDay,
  toEndOfDay,
} = require('../utils/businessRules');
const { tasksToCsv } = require('../utils/csvExporter');

/**
 * Builds search and filter query for tasks
 */
const buildTaskFilterQuery = async (queryParams) => {
  const { search, department, priority, status, dueFrom, dueTo } = queryParams;
  const filter = {};

  // Department filter
  if (department && department !== 'All') {
    filter.department = department;
  }

  // Priority filter
  if (priority && priority !== 'All') {
    filter.priority = priority;
  }

  // Status filter
  if (status && status !== 'All') {
    filter.status = status;
  }

  // Due Date Range filter
  if (dueFrom || dueTo) {
    filter.dueDate = {};
    if (dueFrom) {
      filter.dueDate.$gte = toStartOfDay(dueFrom);
    }
    if (dueTo) {
      filter.dueDate.$lte = toEndOfDay(dueTo);
    }
  }

  // Search by title or employee name
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');

    // Find employees matching search
    const matchingEmployees = await Employee.find({
      $or: [{ fullName: searchRegex }, { employeeId: searchRegex }],
    }).select('_id');
    const empIds = matchingEmployees.map((e) => e._id);

    filter.$or = [
      { title: searchRegex },
      { taskId: searchRegex },
      { assignedEmployee: { $in: empIds } },
      { 'assignedEmployeeSnapshot.fullName': searchRegex },
    ];
  }

  return filter;
};

/**
 * @desc Get all tasks with pagination, search, filters and sorting
 * @route GET /api/tasks
 */
const getTasks = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const { sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const filter = await buildTaskFilterQuery(req.query);

    // Build sort definition
    let sort = {};
    const orderNum = sortOrder === 'asc' ? 1 : -1;

    if (sortBy === 'priority') {
      // For priority, we can sort using aggregation or a priority order mapping
      // If doing normal query, we can use an aggregation pipeline to sort by custom priority rank
    } else {
      sort[sortBy] = orderNum;
    }

    let tasks;
    let total;

    if (sortBy === 'priority') {
      // Use aggregation pipeline to sort by priority importance: Critical (4) > High (3) > Medium (2) > Low (1)
      const pipeline = [
        { $match: filter },
        {
          $addFields: {
            priorityRank: {
              $switch: {
                branches: [
                  { case: { $eq: ['$priority', 'Critical'] }, then: 4 },
                  { case: { $eq: ['$priority', 'High'] }, then: 3 },
                  { case: { $eq: ['$priority', 'Medium'] }, then: 2 },
                  { case: { $eq: ['$priority', 'Low'] }, then: 1 },
                ],
                default: 0,
              },
            },
          },
        },
        { $sort: { priorityRank: orderNum, createdAt: -1 } },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [
              { $skip: skip },
              { $limit: limit },
              {
                $lookup: {
                  from: 'employees',
                  localField: 'assignedEmployee',
                  foreignField: '_id',
                  as: 'assignedEmployee',
                },
              },
              {
                $unwind: {
                  path: '$assignedEmployee',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
          },
        },
      ];

      const aggResult = await Task.aggregate(pipeline);
      total = (aggResult[0].metadata[0] && aggResult[0].metadata[0].total) || 0;
      tasks = aggResult[0].data;
    } else {
      [total, tasks] = await Promise.all([
        Task.countDocuments(filter),
        Task.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('assignedEmployee', 'employeeId fullName email department role status')
          .lean(),
      ]);
    }

    // Add overdue flag and format
    const formattedTasks = tasks.map((task) => ({
      ...task,
      isOverdue: isTaskOverdue(task),
    }));

    res.status(200).json({
      success: true,
      data: formattedTasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single task by ID
 * @route GET /api/tasks/:id
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      'assignedEmployee',
      'employeeId fullName email department role status leaveStartDate leaveEndDate'
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const taskObj = task.toObject();
    taskObj.isOverdue = isTaskOverdue(task);

    res.status(200).json({
      success: true,
      data: taskObj,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create new task
 * @route POST /api/tasks
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedEmployee: employeeId, department, priority = 'Medium', startDate, dueDate } = req.body;

    if (!title || !employeeId || !department || !startDate || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, Assigned Employee, Department, Start Date, and Due Date are required.',
      });
    }

    // Business Rule 1: Due Date cannot be earlier than Start Date
    const dateCheck = validateTaskDates(startDate, dueDate);
    if (!dateCheck.valid) {
      return res.status(400).json({
        success: false,
        message: dateCheck.message,
      });
    }

    // Business Rule 2: Assignment check
    const employee = await Employee.findById(employeeId);
    if (!employee || employee.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Assigned employee not found or is deleted.',
      });
    }

    const assignmentCheck = validateEmployeeAssignment(employee, startDate);
    if (!assignmentCheck.valid) {
      return res.status(400).json({
        success: false,
        message: assignmentCheck.message,
      });
    }

    // Business Rule 3: Capacity check (max 3 active tasks)
    const capacityCheck = await checkEmployeeCapacity(employee._id);
    if (!capacityCheck.allowed) {
      return res.status(400).json({
        success: false,
        message: capacityCheck.message,
      });
    }

    // Generate atomic Task ID (TSK-001, TSK-002, ...)
    const taskId = await getNextSequence('taskId', 'TSK-', 3);

    const task = await Task.create({
      taskId,
      title: title.trim(),
      description: description ? description.trim() : '',
      assignedEmployee: employee._id,
      assignedEmployeeSnapshot: {
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        email: employee.email,
        role: employee.role,
        department: employee.department,
      },
      department,
      priority,
      status: 'Todo', // New tasks ALWAYS start as Todo
      startDate: new Date(startDate),
      dueDate: new Date(dueDate),
      createdDate: new Date(),
      completedDate: null,
    });

    const populatedTask = await Task.findById(task._id).populate('assignedEmployee');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update task (status CANNOT be edited here; Completed/Cancelled tasks CANNOT be edited)
 * @route PUT /api/tasks/:id
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Business Rule: Completed and Cancelled tasks cannot be edited
    if (task.status === 'Completed' || task.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `Task is ${task.status} and cannot be edited. Completed and Cancelled tasks cannot be edited.`,
      });
    }

    // Business Rule: Status CANNOT be updated through normal update API
    if (req.body.status && req.body.status !== task.status) {
      return res.status(400).json({
        success: false,
        message: 'Status cannot be changed through this endpoint. Please use PUT /api/tasks/:id/status.',
      });
    }

    const {
      title,
      description,
      assignedEmployee: newEmployeeId,
      department,
      priority,
      startDate,
      dueDate,
    } = req.body;

    const targetStartDate = startDate || task.startDate;
    const targetDueDate = dueDate || task.dueDate;

    // Business Rule: Validate dates
    const dateCheck = validateTaskDates(targetStartDate, targetDueDate);
    if (!dateCheck.valid) {
      return res.status(400).json({
        success: false,
        message: dateCheck.message,
      });
    }

    // Handle Employee change or re-validation
    const isEmployeeChanged = newEmployeeId && newEmployeeId.toString() !== task.assignedEmployee.toString();
    const effectiveEmployeeId = newEmployeeId || task.assignedEmployee;

    const employee = await Employee.findById(effectiveEmployeeId);
    if (!employee || employee.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Assigned employee not found or is deleted.',
      });
    }

    // Re-verify assignment rules if employee or start date changed
    if (isEmployeeChanged || startDate) {
      const assignmentCheck = validateEmployeeAssignment(employee, targetStartDate);
      if (!assignmentCheck.valid) {
        return res.status(400).json({
          success: false,
          message: assignmentCheck.message,
        });
      }
    }

    // Check capacity if employee changed
    if (isEmployeeChanged) {
      const capacityCheck = await checkEmployeeCapacity(employee._id);
      if (!capacityCheck.allowed) {
        return res.status(400).json({
          success: false,
          message: capacityCheck.message,
        });
      }
      task.assignedEmployee = employee._id;
      task.assignedEmployeeSnapshot = {
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        email: employee.email,
        role: employee.role,
        department: employee.department,
      };
    }

    if (title) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (department) task.department = department;
    if (priority) task.priority = priority;
    if (startDate) task.startDate = new Date(startDate);
    if (dueDate) task.dueDate = new Date(dueDate);

    await task.save();

    const populatedTask = await Task.findById(task._id).populate('assignedEmployee');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update task status only
 * @route PUT /api/tasks/:id/status
 */
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status: newStatus } = req.body;
    if (!newStatus) {
      return res.status(400).json({
        success: false,
        message: 'Status is required.',
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const currentStatus = task.status;

    // Check if task is already completed or cancelled
    if (currentStatus === 'Completed' || currentStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `Task is already ${currentStatus}. Completed and Cancelled tasks cannot be edited or changed.`,
      });
    }

    // Business Rule: Validate status flow
    // Allowed:
    // Todo -> In Progress
    // In Progress -> Completed
    // Todo -> Cancelled
    // In Progress -> Cancelled
    if (!isValidStatusTransition(currentStatus, newStatus)) {
      const allowed = VALID_TRANSITIONS[currentStatus] || [];
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from "${currentStatus}" to "${newStatus}". Allowed next status: ${allowed.length > 0 ? allowed.join(' or ') : 'None'}.`,
      });
    }

    // Business Rule: Completed Date is set by backend when task becomes Completed, never taken from frontend
    if (newStatus === 'Completed') {
      task.completedDate = new Date();
    } else {
      task.completedDate = null;
    }

    task.status = newStatus;
    await task.save();

    const populatedTask = await Task.findById(task._id).populate('assignedEmployee');

    res.status(200).json({
      success: true,
      message: `Task status updated to ${newStatus}`,
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete task
 * @route DELETE /api/tasks/:id
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Export tasks matching all current filters to CSV
 * @route GET /api/tasks/export
 */
const exportTasksCsv = async (req, res, next) => {
  try {
    const filter = await buildTaskFilterQuery(req.query);
    const { sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const orderNum = sortOrder === 'asc' ? 1 : -1;
    let tasks;

    if (sortBy === 'priority') {
      const pipeline = [
        { $match: filter },
        {
          $addFields: {
            priorityRank: {
              $switch: {
                branches: [
                  { case: { $eq: ['$priority', 'Critical'] }, then: 4 },
                  { case: { $eq: ['$priority', 'High'] }, then: 3 },
                  { case: { $eq: ['$priority', 'Medium'] }, then: 2 },
                  { case: { $eq: ['$priority', 'Low'] }, then: 1 },
                ],
                default: 0,
              },
            },
          },
        },
        { $sort: { priorityRank: orderNum, createdAt: -1 } },
        {
          $lookup: {
            from: 'employees',
            localField: 'assignedEmployee',
            foreignField: '_id',
            as: 'assignedEmployee',
          },
        },
        {
          $unwind: {
            path: '$assignedEmployee',
            preserveNullAndEmptyArrays: true,
          },
        },
      ];
      tasks = await Task.aggregate(pipeline);
    } else {
      const sort = {};
      sort[sortBy] = orderNum;
      tasks = await Task.find(filter)
        .sort(sort)
        .populate('assignedEmployee', 'employeeId fullName email department role')
        .lean();
    }

    const csvContent = tasksToCsv(tasks);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="tasks-export-${new Date().toISOString().split('T')[0]}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  exportTasksCsv,
};
