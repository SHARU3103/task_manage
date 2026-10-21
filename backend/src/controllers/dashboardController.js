const { Employee } = require('../models/Employee');
const { Task } = require('../models/Task');

/**
 * @desc Get dashboard statistics and employee workload
 * @route GET /api/dashboard/stats
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();

    // 1. Employee stats (only active, non-deleted employees)
    const [totalEmployees, activeEmployees, inactiveEmployees, onLeaveEmployees] = await Promise.all([
      Employee.countDocuments({ isDeleted: false }),
      Employee.countDocuments({ status: 'Active', isDeleted: false }),
      Employee.countDocuments({ status: 'Inactive', isDeleted: false }),
      Employee.countDocuments({ status: 'On Leave', isDeleted: false }),
    ]);

    // 2. Task stats
    const [
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      cancelledTasks,
      overdueTasks,
    ] = await Promise.all([
      Task.countDocuments({}),
      Task.countDocuments({ status: 'Todo' }),
      Task.countDocuments({ status: 'In Progress' }),
      Task.countDocuments({ status: 'Completed' }),
      Task.countDocuments({ status: 'Cancelled' }),
      // Overdue: today is later than Due Date and status is not Completed or Cancelled
      Task.countDocuments({
        status: { $nin: ['Completed', 'Cancelled'] },
        dueDate: { $lt: now },
      }),
    ]);

    // 3. Employee Workload (active tasks: Todo + In Progress per employee)
    // Aggregation on active tasks grouped by employee
    const workloadAggregation = await Task.aggregate([
      {
        $match: {
          status: { $in: ['Todo', 'In Progress'] },
        },
      },
      {
        $group: {
          _id: '$assignedEmployee',
          activeTasks: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employeeInfo',
        },
      },
      {
        $unwind: {
          path: '$employeeInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          employeeId: { $ifNull: ['$employeeInfo.employeeId', 'N/A'] },
          employeeName: { $ifNull: ['$employeeInfo.fullName', 'Unknown Employee'] },
          department: { $ifNull: ['$employeeInfo.department', 'N/A'] },
          status: { $ifNull: ['$employeeInfo.status', 'Inactive'] },
          activeTasks: 1,
        },
      },
      {
        $sort: { activeTasks: -1, employeeName: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: inactiveEmployees,
          onLeave: onLeaveEmployees,
        },
        tasks: {
          total: totalTasks,
          todo: todoTasks,
          inProgress: inProgressTasks,
          completed: completedTasks,
          cancelled: cancelledTasks,
          overdue: overdueTasks,
        },
        employeeWorkload: workloadAggregation,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
