const { Employee, DEPARTMENTS, EMPLOYEE_STATUSES } = require('../models/Employee');
const { Task } = require('../models/Task');
const { toStartOfDay, toEndOfDay } = require('../utils/businessRules');

/**
 * @desc Get all employees with pagination, search, filter and sorting
 * @route GET /api/employees
 */
const getEmployees = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const { search, department, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = { isDeleted: false };

    // Search by name, employeeId, email, or role
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { fullName: searchRegex },
        { employeeId: searchRegex },
        { email: searchRegex },
        { role: searchRegex },
      ];
    }

    // Filter by department
    if (department && department !== 'All') {
      query.department = department;
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Sorting
    const sort = {};
    const order = sortOrder === 'asc' ? 1 : -1;
    sort[sortBy] = order;

    const [total, employees] = await Promise.all([
      Employee.countDocuments(query),
      Employee.find(query).sort(sort).skip(skip).limit(limit).lean(),
    ]);

    // Attach active tasks count for each employee
    const employeeIds = employees.map((emp) => emp._id);
    const activeTasksCounts = await Task.aggregate([
      {
        $match: {
          assignedEmployee: { $in: employeeIds },
          status: { $in: ['Todo', 'In Progress'] },
        },
      },
      {
        $group: {
          _id: '$assignedEmployee',
          activeCount: { $sum: 1 },
        },
      },
    ]);

    const activeMap = {};
    activeTasksCounts.forEach((item) => {
      activeMap[item._id.toString()] = item.activeCount;
    });

    const employeesWithWorkload = employees.map((emp) => ({
      ...emp,
      activeTasksCount: activeMap[emp._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      data: employeesWithWorkload,
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
 * @desc Get single employee by ID with assigned tasks history
 * @route GET /api/employees/:id
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee || employee.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Get employee tasks
    const tasks = await Task.find({ assignedEmployee: employee._id }).sort({ createdAt: -1 });
    const activeTasksCount = tasks.filter((t) => ['Todo', 'In Progress'].includes(t.status)).length;
    const completedTasksCount = tasks.filter((t) => t.status === 'Completed').length;

    res.status(200).json({
      success: true,
      data: {
        ...employee.toObject(),
        activeTasksCount,
        completedTasksCount,
        totalTasksAssigned: tasks.length,
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create new employee
 * @route POST /api/employees
 */
const createEmployee = async (req, res, next) => {
  try {
    const {
      employeeId,
      fullName,
      email,
      phone,
      department,
      role,
      joiningDate,
      status = 'Active',
      skills = [],
      leaveStartDate,
      leaveEndDate,
    } = req.body;

    if (!employeeId || !fullName || !email || !phone || !department || !role || !joiningDate) {
      return res.status(400).json({
        success: false,
        message: 'All required fields (Employee ID, Full Name, Email, Phone, Department, Role, Joining Date) must be provided.',
      });
    }

    // Check duplicate employee ID
    const normalizedEmpId = employeeId.trim().toUpperCase();
    const existingId = await Employee.findOne({ employeeId: normalizedEmpId, isDeleted: false });
    if (existingId) {
      return res.status(409).json({
        success: false,
        message: `Employee ID "${normalizedEmpId}" already exists.`,
      });
    }

    // Check duplicate email
    const normalizedEmail = email.trim().toLowerCase();
    const existingEmail = await Employee.findOne({ email: normalizedEmail, isDeleted: false });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: `Email "${normalizedEmail}" is already registered.`,
      });
    }

    // Handle Leave validation
    let parsedLeaveStart = null;
    let parsedLeaveEnd = null;
    if (status === 'On Leave') {
      if (!leaveStartDate || !leaveEndDate) {
        return res.status(400).json({
          success: false,
          message: 'Leave Start Date and Leave End Date are required when status is On Leave.',
        });
      }
      parsedLeaveStart = toStartOfDay(leaveStartDate);
      parsedLeaveEnd = toEndOfDay(leaveEndDate);
      if (parsedLeaveEnd < parsedLeaveStart) {
        return res.status(400).json({
          success: false,
          message: 'Leave End Date cannot be earlier than Leave Start Date.',
        });
      }
    }

    const employee = await Employee.create({
      employeeId: normalizedEmpId,
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      department,
      role: role.trim(),
      joiningDate: new Date(joiningDate),
      status,
      skills: Array.isArray(skills) ? skills : typeof skills === 'string' ? skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      leaveStartDate: parsedLeaveStart,
      leaveEndDate: parsedLeaveEnd,
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update employee
 * @route PUT /api/employees/:id
 */
const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee || employee.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const {
      employeeId,
      fullName,
      email,
      phone,
      department,
      role,
      joiningDate,
      status,
      skills,
      leaveStartDate,
      leaveEndDate,
    } = req.body;

    // Check duplicate employee ID if changed
    if (employeeId && employeeId.trim().toUpperCase() !== employee.employeeId) {
      const normalizedEmpId = employeeId.trim().toUpperCase();
      const existingId = await Employee.findOne({
        _id: { $ne: employee._id },
        employeeId: normalizedEmpId,
        isDeleted: false,
      });
      if (existingId) {
        return res.status(409).json({
          success: false,
          message: `Employee ID "${normalizedEmpId}" already exists.`,
        });
      }
      employee.employeeId = normalizedEmpId;
    }

    // Check duplicate email if changed
    if (email && email.trim().toLowerCase() !== employee.email) {
      const normalizedEmail = email.trim().toLowerCase();
      const existingEmail = await Employee.findOne({
        _id: { $ne: employee._id },
        email: normalizedEmail,
        isDeleted: false,
      });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: `Email "${normalizedEmail}" is already registered.`,
        });
      }
      employee.email = normalizedEmail;
    }

    if (fullName) employee.fullName = fullName.trim();
    if (phone) employee.phone = phone.trim();
    if (department) employee.department = department;
    if (role) employee.role = role.trim();
    if (joiningDate) employee.joiningDate = new Date(joiningDate);
    if (skills !== undefined) {
      employee.skills = Array.isArray(skills) ? skills : typeof skills === 'string' ? skills.split(',').map((s) => s.trim()).filter(Boolean) : [];
    }

    if (status) {
      if (status === 'On Leave') {
        const start = leaveStartDate || employee.leaveStartDate;
        const end = leaveEndDate || employee.leaveEndDate;
        if (!start || !end) {
          return res.status(400).json({
            success: false,
            message: 'Leave Start Date and Leave End Date are required when status is On Leave.',
          });
        }
        const parsedStart = toStartOfDay(start);
        const parsedEnd = toEndOfDay(end);
        if (parsedEnd < parsedStart) {
          return res.status(400).json({
            success: false,
            message: 'Leave End Date cannot be earlier than Leave Start Date.',
          });
        }
        employee.leaveStartDate = parsedStart;
        employee.leaveEndDate = parsedEnd;
      } else {
        // Clear leave dates when status is not On Leave
        employee.leaveStartDate = null;
        employee.leaveEndDate = null;
      }
      employee.status = status;
    }

    await employee.save();

    // Update snapshot on tasks assigned to this employee to keep details synchronized
    await Task.updateMany(
      { assignedEmployee: employee._id },
      {
        $set: {
          assignedEmployeeSnapshot: {
            employeeId: employee.employeeId,
            fullName: employee.fullName,
            email: employee.email,
            role: employee.role,
            department: employee.department,
          },
        },
      }
    );

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete employee (soft delete with business rule check)
 * @route DELETE /api/employees/:id
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee || employee.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Business rule: Delete employee not allowed while employee has Todo / In Progress tasks
    const activeTasksCount = await Task.countDocuments({
      assignedEmployee: employee._id,
      status: { $in: ['Todo', 'In Progress'] },
    });

    if (activeTasksCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete employee: employee currently has ${activeTasksCount} active task(s) (Todo or In Progress). Please reassign or complete these tasks first.`,
      });
    }

    // Soft delete to ensure old tasks still show meaningful employee details
    employee.isDeleted = true;
    employee.deletedAt = new Date();
    employee.status = 'Inactive';
    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully. Historical task records have preserved employee details.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
