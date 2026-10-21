const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Employee } = require('../models/Employee');
const { Task } = require('../models/Task');
const { Counter } = require('../models/Counter');
const {
  isValidStatusTransition,
  validateEmployeeAssignment,
  checkEmployeeCapacity,
  validateTaskDates,
  isTaskOverdue,
} = require('../utils/businessRules');

dotenv.config();

const runTests = async () => {
  console.log('--- Starting Business Rules Test Suite ---');
  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`PASS: ${description}`);
      passed++;
    } else {
      console.error(`FAIL: ${description}`);
      failed++;
    }
  };

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/employee_task_management';
  await mongoose.connect(mongoUri);

  // Test 1: Date validation (Due Date cannot be earlier than Start Date)
  const dateCheck1 = validateTaskDates('2026-10-15', '2026-10-10');
  assert(!dateCheck1.valid, 'Rule: Due Date earlier than Start Date is rejected');

  const dateCheck2 = validateTaskDates('2026-10-15', '2026-10-20');
  assert(dateCheck2.valid, 'Rule: Due Date after Start Date is allowed');

  const dateCheck3 = validateTaskDates('2026-10-15', '2026-10-15');
  assert(dateCheck3.valid, 'Rule: Due Date equal to Start Date is allowed');

  // Test 2: Inactive employee assignment rejected
  const inactiveEmp = await Employee.findOne({ status: 'Inactive', isDeleted: false });
  if (inactiveEmp) {
    const inactiveAssignment = validateEmployeeAssignment(inactiveEmp, '2026-10-18');
    assert(!inactiveAssignment.valid, 'Rule: Task assignment to Inactive employee is always rejected');
  }

  // Test 3: On Leave employee assignment rejected inside leave, allowed outside
  const onLeaveEmp = await Employee.findOne({ status: 'On Leave', isDeleted: false });
  if (onLeaveEmp) {
    // Task start date inside leave
    const insideAssignment = validateEmployeeAssignment(onLeaveEmp, onLeaveEmp.leaveStartDate);
    assert(!insideAssignment.valid, 'Rule: Task assignment to On Leave employee inside leave window is rejected');

    // Task start date outside leave
    const outsideDate = new Date(onLeaveEmp.leaveEndDate);
    outsideDate.setDate(outsideDate.getDate() + 5);
    const outsideAssignment = validateEmployeeAssignment(onLeaveEmp, outsideDate);
    assert(outsideAssignment.valid, 'Rule: Task assignment to On Leave employee outside leave window is allowed');
  }

  // Test 4: Status flow transitions
  assert(isValidStatusTransition('Todo', 'In Progress'), 'Rule: Todo -> In Progress is allowed');
  assert(isValidStatusTransition('In Progress', 'Completed'), 'Rule: In Progress -> Completed is allowed');
  assert(isValidStatusTransition('Todo', 'Cancelled'), 'Rule: Todo -> Cancelled is allowed');
  assert(isValidStatusTransition('In Progress', 'Cancelled'), 'Rule: In Progress -> Cancelled is allowed');

  assert(!isValidStatusTransition('Todo', 'Completed'), 'Rule: Todo -> Completed directly is rejected');
  assert(!isValidStatusTransition('Completed', 'In Progress'), 'Rule: Completed -> In Progress is rejected');
  assert(!isValidStatusTransition('Completed', 'Cancelled'), 'Rule: Completed -> Cancelled is rejected');
  assert(!isValidStatusTransition('Cancelled', 'Todo'), 'Rule: Cancelled -> Todo is rejected');
  assert(!isValidStatusTransition('Cancelled', 'Completed'), 'Rule: Cancelled -> Completed is rejected');

  // Test 5: Capacity limit (maximum 3 active tasks: Todo + In Progress)
  const rahul = await Employee.findOne({ employeeId: 'EMP-001' });
  if (rahul) {
    const capacityResult = await checkEmployeeCapacity(rahul._id);
    assert(!capacityResult.allowed && capacityResult.activeCount >= 3, 'Rule: Employee with 3 active tasks cannot be assigned a 4th active task');
  }

  // Test 6: Overdue check
  const pastTask = { status: 'In Progress', dueDate: new Date('2020-01-01') };
  const futureTask = { status: 'In Progress', dueDate: new Date('2030-01-01') };
  const completedPastTask = { status: 'Completed', dueDate: new Date('2020-01-01') };
  const cancelledPastTask = { status: 'Cancelled', dueDate: new Date('2020-01-01') };

  assert(isTaskOverdue(pastTask), 'Rule: Past due date on In Progress task is Overdue');
  assert(!isTaskOverdue(futureTask), 'Rule: Future due date on In Progress task is NOT Overdue');
  assert(!isTaskOverdue(completedPastTask), 'Rule: Completed task is NEVER Overdue even if due date was in past');
  assert(!isTaskOverdue(cancelledPastTask), 'Rule: Cancelled task is NEVER Overdue even if due date was in past');

  console.log(`\nTest Suite Summary: ${passed} Passed, ${failed} Failed`);
  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
};

runTests();
