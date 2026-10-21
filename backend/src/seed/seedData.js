const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Employee } = require('../models/Employee');
const { Task } = require('../models/Task');
const { Counter } = require('../models/Counter');

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/employee_task_management';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await Employee.deleteMany({});
    await Task.deleteMany({});
    await Counter.deleteMany({});

    console.log('Cleared existing database data.');

    // Reset task sequence counter
    await Counter.create({ id: 'taskId', seq: 0 });

    // Seed 12 employees (8 Active, 2 Inactive, 2 On Leave)
    const employeesData = [
      {
        employeeId: 'EMP-001',
        fullName: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91 98765 43210',
        department: 'Development',
        role: 'Senior Full Stack Developer',
        joiningDate: new Date('2023-01-15'),
        status: 'Active',
        skills: ['React', 'Node.js', 'MongoDB', 'Express', 'TypeScript'],
      },
      {
        employeeId: 'EMP-002',
        fullName: 'Priya Patil',
        email: 'priya.patil@example.com',
        phone: '+91 98765 43211',
        department: 'Design',
        role: 'Lead UI/UX Designer',
        joiningDate: new Date('2023-03-10'),
        status: 'Active',
        skills: ['Figma', 'UI Design', 'Design Systems', 'CSS', 'Tailwind'],
      },
      {
        employeeId: 'EMP-003',
        fullName: 'Amit Joshi',
        email: 'amit.joshi@example.com',
        phone: '+91 98765 43212',
        department: 'QA',
        role: 'QA Automation Engineer',
        joiningDate: new Date('2023-05-20'),
        status: 'Active',
        skills: ['Selenium', 'Jest', 'Cypress', 'API Testing', 'Postman'],
      },
      {
        employeeId: 'EMP-004',
        fullName: 'Sneha Rao',
        email: 'sneha.rao@example.com',
        phone: '+91 98765 43213',
        department: 'Development',
        role: 'Frontend Engineer',
        joiningDate: new Date('2023-08-01'),
        status: 'Active',
        skills: ['React', 'Vue', 'Next.js', 'JavaScript'],
      },
      {
        employeeId: 'EMP-005',
        fullName: 'Vikram Mehta',
        email: 'vikram.mehta@example.com',
        phone: '+91 98765 43214',
        department: 'Development',
        role: 'Backend Architect',
        joiningDate: new Date('2022-11-15'),
        status: 'Active',
        skills: ['Node.js', 'Express', 'Microservices', 'Docker', 'Redis'],
      },
      {
        employeeId: 'EMP-006',
        fullName: 'Ananya Verma',
        email: 'ananya.verma@example.com',
        phone: '+91 98765 43215',
        department: 'HR',
        role: 'HR Manager',
        joiningDate: new Date('2022-09-01'),
        status: 'Active',
        skills: ['Talent Acquisition', 'Employee Relations', 'HR Operations'],
      },
      {
        employeeId: 'EMP-007',
        fullName: 'Rohan Gupta',
        email: 'rohan.gupta@example.com',
        phone: '+91 98765 43216',
        department: 'Sales',
        role: 'Enterprise Sales Lead',
        joiningDate: new Date('2023-02-01'),
        status: 'Active',
        skills: ['B2B Sales', 'CRM', 'Lead Generation', 'Client Relations'],
      },
      {
        employeeId: 'EMP-008',
        fullName: 'Kavita Nair',
        email: 'kavita.nair@example.com',
        phone: '+91 98765 43217',
        department: 'QA',
        role: 'Manual QA Specialist',
        joiningDate: new Date('2023-07-15'),
        status: 'Active',
        skills: ['Manual Testing', 'Bug Tracking', 'Test Case Design'],
      },
      // 2 Inactive Employees
      {
        employeeId: 'EMP-009',
        fullName: 'Suresh Raina',
        email: 'suresh.raina@example.com',
        phone: '+91 98765 43218',
        department: 'Development',
        role: 'Junior Developer',
        joiningDate: new Date('2022-01-10'),
        status: 'Inactive',
        skills: ['HTML', 'CSS', 'JavaScript'],
      },
      {
        employeeId: 'EMP-010',
        fullName: 'Neha Kapoor',
        email: 'neha.kapoor@example.com',
        phone: '+91 98765 43219',
        department: 'Sales',
        role: 'Sales Representative',
        joiningDate: new Date('2023-04-12'),
        status: 'Inactive',
        skills: ['Cold Calling', 'Negotiation'],
      },
      // 2 On Leave Employees
      {
        employeeId: 'EMP-011',
        fullName: 'Arjun Singh',
        email: 'arjun.singh@example.com',
        phone: '+91 98765 43220',
        department: 'Development',
        role: 'DevOps Engineer',
        joiningDate: new Date('2022-06-01'),
        status: 'On Leave',
        leaveStartDate: new Date('2026-10-10'),
        leaveEndDate: new Date('2026-10-25'),
        skills: ['Kubernetes', 'Docker', 'AWS', 'CI/CD'],
      },
      {
        employeeId: 'EMP-012',
        fullName: 'Divya Iyer',
        email: 'divya.iyer@example.com',
        phone: '+91 98765 43221',
        department: 'Design',
        role: 'Graphic Designer',
        joiningDate: new Date('2023-09-01'),
        status: 'On Leave',
        leaveStartDate: new Date('2026-10-15'),
        leaveEndDate: new Date('2026-11-05'),
        skills: ['Photoshop', 'Illustrator', 'Branding'],
      },
    ];

    const insertedEmployees = await Employee.insertMany(employeesData);
    console.log(`Seeded ${insertedEmployees.length} employees.`);

    // Map for easy employee reference
    const empByCode = {};
    insertedEmployees.forEach((e) => {
      empByCode[e.employeeId] = e;
    });

    const createSnapshot = (emp) => ({
      employeeId: emp.employeeId,
      fullName: emp.fullName,
      email: emp.email,
      role: emp.role,
      department: emp.department,
    });

    // Helper date generator
    const daysAgo = (days) => {
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d;
    };
    const daysAhead = (days) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d;
    };

    // We need:
    // Total Tasks: 40
    // Todo: 14
    // In Progress: 9 (Total active = 23)
    // Completed: 14
    // Cancelled: 3
    // Overdue tasks: 5 (active tasks with dueDate in the past)
    // Workloads:
    // Rahul Sharma: 3 active (e.g. 2 In Progress, 1 Todo, one overdue)
    // Priya Patil: 2 active (e.g. 1 In Progress, 1 Todo)
    // Amit Joshi: 1 active (e.g. 1 Todo)
    // Sneha Rao: 3 active
    // Vikram Mehta: 3 active
    // Ananya Verma: 3 active
    // Rohan Gupta: 3 active
    // Kavita Nair: 3 active
    // Arjun Singh (On Leave): 2 active (assigned before leave)
    // Total active = 3 + 2 + 1 + 3 + 3 + 3 + 3 + 3 + 2 = 23 active (9 In Progress, 14 Todo).
    // Exactly matches 14 Todo + 9 In Progress = 23 active tasks!

    const tasksToInsert = [
      // 1. TSK-001 (Rahul Sharma - In Progress - Overdue)
      {
        taskId: 'TSK-001',
        title: 'Fix payment API bug',
        description: 'Payment gateway webhooks are failing intermittently under peak traffic.',
        assignedEmployee: empByCode['EMP-001']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-001']),
        department: 'Development',
        priority: 'High',
        status: 'In Progress',
        startDate: daysAgo(10),
        dueDate: daysAgo(3), // Overdue!
      },
      // 2. TSK-002 (Priya Patil - In Progress)
      {
        taskId: 'TSK-002',
        title: 'Design login screen',
        description: 'Create responsive login and password recovery layouts in Figma.',
        assignedEmployee: empByCode['EMP-002']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-002']),
        department: 'Design',
        priority: 'Medium',
        status: 'In Progress',
        startDate: daysAgo(5),
        dueDate: daysAhead(5),
      },
      // 3. TSK-003 (Amit Joshi - Completed)
      {
        taskId: 'TSK-003',
        title: 'Write test cases for Auth module',
        description: 'Automate login, signup, and token expiration regression test suite.',
        assignedEmployee: empByCode['EMP-003']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-003']),
        department: 'QA',
        priority: 'Low',
        status: 'Completed',
        startDate: daysAgo(20),
        dueDate: daysAgo(15),
        completedDate: daysAgo(16),
      },
      // 4. TSK-004 (Priya Patil - Cancelled)
      {
        taskId: 'TSK-004',
        title: 'Update landing page illustration',
        description: 'Replaced with 3D product render asset.',
        assignedEmployee: empByCode['EMP-002']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-002']),
        department: 'Design',
        priority: 'Critical',
        status: 'Cancelled',
        startDate: daysAgo(12),
        dueDate: daysAgo(2),
      },
      // 5. TSK-005 (Rahul Sharma - Todo)
      {
        taskId: 'TSK-005',
        title: 'Setup CI pipeline',
        description: 'Configure GitHub Actions workflow for linting, testing, and Docker builds.',
        assignedEmployee: empByCode['EMP-001']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-001']),
        department: 'Development',
        priority: 'High',
        status: 'Todo',
        startDate: daysAhead(1),
        dueDate: daysAhead(7),
      },
      // 6. Rahul Sharma - 3rd active task (In Progress)
      {
        taskId: 'TSK-006',
        title: 'Refactor database query performance',
        description: 'Add compound indexes and optimize aggregation pipelines.',
        assignedEmployee: empByCode['EMP-001']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-001']),
        department: 'Development',
        priority: 'Critical',
        status: 'In Progress',
        startDate: daysAgo(2),
        dueDate: daysAhead(4),
      },
      // 7. Priya Patil - 2nd active task (Todo - Overdue)
      {
        taskId: 'TSK-007',
        title: 'Design mobile navigation drawer',
        description: 'Prepare responsive drawer navigation mockups.',
        assignedEmployee: empByCode['EMP-002']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-002']),
        department: 'Design',
        priority: 'Medium',
        status: 'Todo',
        startDate: daysAgo(8),
        dueDate: daysAgo(1), // Overdue!
      },
      // 8. Amit Joshi - 1st active task (Todo)
      {
        taskId: 'TSK-008',
        title: 'API endpoint security audit',
        description: 'Perform penetration testing on authenticated endpoints.',
        assignedEmployee: empByCode['EMP-003']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-003']),
        department: 'QA',
        priority: 'High',
        status: 'Todo',
        startDate: daysAhead(2),
        dueDate: daysAhead(10),
      },
      // 9. Sneha Rao - In Progress (Overdue)
      {
        taskId: 'TSK-009',
        title: 'Implement Dark Mode theme switcher',
        description: 'Store user preferences in localStorage and persist across sessions.',
        assignedEmployee: empByCode['EMP-004']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-004']),
        department: 'Development',
        priority: 'Medium',
        status: 'In Progress',
        startDate: daysAgo(14),
        dueDate: daysAgo(2), // Overdue!
      },
      // 10. Sneha Rao - Todo
      {
        taskId: 'TSK-010',
        title: 'Fix table pagination component layout shift',
        description: 'Ensure smooth page transition without jumping.',
        assignedEmployee: empByCode['EMP-004']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-004']),
        department: 'Development',
        priority: 'Low',
        status: 'Todo',
        startDate: daysAhead(1),
        dueDate: daysAhead(6),
      },
      // 11. Sneha Rao - Todo
      {
        taskId: 'TSK-011',
        title: 'Add skeleton loading states to Task table',
        description: 'Improve perceived loading speed.',
        assignedEmployee: empByCode['EMP-004']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-004']),
        department: 'Development',
        priority: 'Low',
        status: 'Todo',
        startDate: daysAhead(3),
        dueDate: daysAhead(8),
      },
      // 12. Vikram Mehta - In Progress (Overdue)
      {
        taskId: 'TSK-012',
        title: 'Audit Redis cache memory consumption',
        description: 'Investigate memory spikes during bulk report generation.',
        assignedEmployee: empByCode['EMP-005']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-005']),
        department: 'Development',
        priority: 'Critical',
        status: 'In Progress',
        startDate: daysAgo(10),
        dueDate: daysAgo(4), // Overdue!
      },
      // 13. Vikram Mehta - In Progress
      {
        taskId: 'TSK-013',
        title: 'Migrate session storage to JWT refresh tokens',
        description: 'Implement token rotation and blacklisting.',
        assignedEmployee: empByCode['EMP-005']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-005']),
        department: 'Development',
        priority: 'High',
        status: 'In Progress',
        startDate: daysAgo(3),
        dueDate: daysAhead(5),
      },
      // 14. Vikram Mehta - Todo
      {
        taskId: 'TSK-014',
        title: 'Setup rate limiting middleware on public APIs',
        description: 'Prevent brute force and abusive traffic spikes.',
        assignedEmployee: empByCode['EMP-005']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-005']),
        department: 'Development',
        priority: 'High',
        status: 'Todo',
        startDate: daysAhead(2),
        dueDate: daysAhead(9),
      },
      // 15. Ananya Verma - In Progress (Overdue)
      {
        taskId: 'TSK-015',
        title: 'Q4 Performance Review schedule preparation',
        description: 'Organize 1-on-1 interview calendars for department heads.',
        assignedEmployee: empByCode['EMP-006']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-006']),
        department: 'HR',
        priority: 'High',
        status: 'In Progress',
        startDate: daysAgo(9),
        dueDate: daysAgo(1), // Overdue! (5th overdue task!)
      },
      // 16. Ananya Verma - Todo
      {
        taskId: 'TSK-016',
        title: 'Update onboarding employee handbook',
        description: 'Revise remote work and leave policy documentation.',
        assignedEmployee: empByCode['EMP-006']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-006']),
        department: 'HR',
        priority: 'Medium',
        status: 'Todo',
        startDate: daysAhead(1),
        dueDate: daysAhead(8),
      },
      // 17. Ananya Verma - Todo
      {
        taskId: 'TSK-017',
        title: 'Health insurance renewal coordination',
        description: 'Distribute revised policy options to company staff.',
        assignedEmployee: empByCode['EMP-006']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-006']),
        department: 'HR',
        priority: 'Medium',
        status: 'Todo',
        startDate: daysAhead(3),
        dueDate: daysAhead(12),
      },
      // 18. Rohan Gupta - In Progress
      {
        taskId: 'TSK-018',
        title: 'Enterprise Q4 Sales Pitch presentation',
        description: 'Prepare customer case studies and ROI calculations.',
        assignedEmployee: empByCode['EMP-007']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-007']),
        department: 'Sales',
        priority: 'Critical',
        status: 'In Progress',
        startDate: daysAgo(4),
        dueDate: daysAhead(3),
      },
      // 19. Rohan Gupta - Todo
      {
        taskId: 'TSK-019',
        title: 'Follow up with inbound demo leads',
        description: 'Schedule discovery calls for enterprise inquiries.',
        assignedEmployee: empByCode['EMP-007']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-007']),
        department: 'Sales',
        priority: 'High',
        status: 'Todo',
        startDate: daysAhead(1),
        dueDate: daysAhead(4),
      },
      // 20. Rohan Gupta - Todo
      {
        taskId: 'TSK-020',
        title: 'Prepare monthly sales pipeline forecasts',
        description: 'Compile revenue probability metrics for leadership review.',
        assignedEmployee: empByCode['EMP-007']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-007']),
        department: 'Sales',
        priority: 'Medium',
        status: 'Todo',
        startDate: daysAhead(4),
        dueDate: daysAhead(11),
      },
      // 21. Kavita Nair - In Progress
      {
        taskId: 'TSK-021',
        title: 'Cross-browser compatibility testing on Safari & Firefox',
        description: 'Verify CSS grid layouts and sticky headers.',
        assignedEmployee: empByCode['EMP-008']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-008']),
        department: 'QA',
        priority: 'Medium',
        status: 'In Progress',
        startDate: daysAgo(2),
        dueDate: daysAhead(4),
      },
      // 22. Kavita Nair - Todo
      {
        taskId: 'TSK-022',
        title: 'Accessibility audit for screen readers',
        description: 'Check ARIA landmarks, alt attributes, and tab keyboard order.',
        assignedEmployee: empByCode['EMP-008']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-008']),
        department: 'QA',
        priority: 'High',
        status: 'Todo',
        startDate: daysAhead(2),
        dueDate: daysAhead(8),
      },
      // 23. Kavita Nair - Todo
      {
        taskId: 'TSK-023',
        title: 'Validate form validation edge cases',
        description: 'Test special characters, SQL injection escapes, and length boundaries.',
        assignedEmployee: empByCode['EMP-008']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-008']),
        department: 'QA',
        priority: 'Low',
        status: 'Todo',
        startDate: daysAhead(5),
        dueDate: daysAhead(12),
      },
      // 24. Arjun Singh (On Leave) - Todo (assigned before leave)
      {
        taskId: 'TSK-024',
        title: 'Upgrade Kubernetes cluster to v1.30',
        description: 'Schedule maintenance window for node pool upgrade.',
        assignedEmployee: empByCode['EMP-011']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-011']),
        department: 'Development',
        priority: 'High',
        status: 'Todo',
        startDate: daysAgo(15),
        dueDate: daysAhead(20),
      },
      // 25. Arjun Singh (On Leave) - Todo
      {
        taskId: 'TSK-025',
        title: 'Review AWS CloudWatch alerts & thresholds',
        description: 'Fine-tune alarm thresholds to eliminate false positives.',
        assignedEmployee: empByCode['EMP-011']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-011']),
        department: 'Development',
        priority: 'Medium',
        status: 'Todo',
        startDate: daysAgo(12),
        dueDate: daysAhead(25),
      },

      // Now 13 more Completed tasks (to make total 14 completed)
      {
        taskId: 'TSK-026',
        title: 'Initial Database schema migration',
        description: 'Created Mongoose models and validation indexes.',
        assignedEmployee: empByCode['EMP-001']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-001']),
        department: 'Development',
        priority: 'Critical',
        status: 'Completed',
        startDate: daysAgo(40),
        dueDate: daysAgo(30),
        completedDate: daysAgo(32),
      },
      {
        taskId: 'TSK-027',
        title: 'Design color palette & typography tokens',
        description: 'Established primary and secondary design tokens.',
        assignedEmployee: empByCode['EMP-002']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-002']),
        department: 'Design',
        priority: 'High',
        status: 'Completed',
        startDate: daysAgo(45),
        dueDate: daysAgo(35),
        completedDate: daysAgo(36),
      },
      {
        taskId: 'TSK-028',
        title: 'Setup Jest unit testing framework',
        description: 'Configured test runners and mock environments.',
        assignedEmployee: empByCode['EMP-003']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-003']),
        department: 'QA',
        priority: 'Medium',
        status: 'Completed',
        startDate: daysAgo(35),
        dueDate: daysAgo(25),
        completedDate: daysAgo(26),
      },
      {
        taskId: 'TSK-029',
        title: 'Create employee search endpoint',
        description: 'Implemented regex text search with pagination.',
        assignedEmployee: empByCode['EMP-004']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-004']),
        department: 'Development',
        priority: 'High',
        status: 'Completed',
        startDate: daysAgo(30),
        dueDate: daysAgo(20),
        completedDate: daysAgo(22),
      },
      {
        taskId: 'TSK-030',
        title: 'Configure MongoDB Replica Set',
        description: 'Prepared replica set for transaction support.',
        assignedEmployee: empByCode['EMP-005']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-005']),
        department: 'Development',
        priority: 'Critical',
        status: 'Completed',
        startDate: daysAgo(50),
        dueDate: daysAgo(40),
        completedDate: daysAgo(42),
      },
      {
        taskId: 'TSK-031',
        title: 'Publish Job descriptions on career portal',
        description: 'Listed positions for frontend and QA specialists.',
        assignedEmployee: empByCode['EMP-006']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-006']),
        department: 'HR',
        priority: 'Low',
        status: 'Completed',
        startDate: daysAgo(25),
        dueDate: daysAgo(15),
        completedDate: daysAgo(17),
      },
      {
        taskId: 'TSK-032',
        title: 'Client onboarding for Roots Media campaign',
        description: 'Delivered initial orientation and shared project timeline.',
        assignedEmployee: empByCode['EMP-007']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-007']),
        department: 'Sales',
        priority: 'High',
        status: 'Completed',
        startDate: daysAgo(22),
        dueDate: daysAgo(12),
        completedDate: daysAgo(14),
      },
      {
        taskId: 'TSK-033',
        title: 'Execute load testing with Apache JMeter',
        description: 'Simulated 1,000 concurrent API users successfully.',
        assignedEmployee: empByCode['EMP-008']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-008']),
        department: 'QA',
        priority: 'Critical',
        status: 'Completed',
        startDate: daysAgo(28),
        dueDate: daysAgo(18),
        completedDate: daysAgo(19),
      },
      {
        taskId: 'TSK-034',
        title: 'Setup SSL certificates and Nginx reverse proxy',
        description: 'Configured automated Let’s Encrypt certificate renewal.',
        assignedEmployee: empByCode['EMP-011']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-011']),
        department: 'Development',
        priority: 'High',
        status: 'Completed',
        startDate: daysAgo(38),
        dueDate: daysAgo(28),
        completedDate: daysAgo(29),
      },
      {
        taskId: 'TSK-035',
        title: 'Design corporate brand guidelines PDF',
        description: 'Exported high-res vector assets and typography spec.',
        assignedEmployee: empByCode['EMP-012']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-012']),
        department: 'Design',
        priority: 'Low',
        status: 'Completed',
        startDate: daysAgo(35),
        dueDate: daysAgo(25),
        completedDate: daysAgo(26),
      },
      {
        taskId: 'TSK-036',
        title: 'Implement CORS security headers',
        description: 'Whitelisted frontend origin and allowed methods.',
        assignedEmployee: empByCode['EMP-001']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-001']),
        department: 'Development',
        priority: 'Medium',
        status: 'Completed',
        startDate: daysAgo(20),
        dueDate: daysAgo(14),
        completedDate: daysAgo(15),
      },
      {
        taskId: 'TSK-037',
        title: 'Benchmark API response times',
        description: 'Achieved sub-50ms latency on core endpoints.',
        assignedEmployee: empByCode['EMP-005']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-005']),
        department: 'Development',
        priority: 'Medium',
        status: 'Completed',
        startDate: daysAgo(18),
        dueDate: daysAgo(10),
        completedDate: daysAgo(11),
      },
      {
        taskId: 'TSK-038',
        title: 'Organize quarterly all-hands meeting',
        description: 'Booked conference room and distributed slides.',
        assignedEmployee: empByCode['EMP-006']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-006']),
        department: 'HR',
        priority: 'Low',
        status: 'Completed',
        startDate: daysAgo(16),
        dueDate: daysAgo(8),
        completedDate: daysAgo(9),
      },

      // Now 2 more Cancelled tasks (to make total 3 cancelled)
      {
        taskId: 'TSK-039',
        title: 'Legacy SOAP service integration',
        description: 'Cancelled due to vendor deprecating the protocol in favor of REST.',
        assignedEmployee: empByCode['EMP-005']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-005']),
        department: 'Development',
        priority: 'Low',
        status: 'Cancelled',
        startDate: daysAgo(40),
        dueDate: daysAgo(30),
      },
      {
        taskId: 'TSK-040',
        title: 'Print marketing brochure design',
        description: 'Project paused by marketing department.',
        assignedEmployee: empByCode['EMP-002']._id,
        assignedEmployeeSnapshot: createSnapshot(empByCode['EMP-002']),
        department: 'Design',
        priority: 'Medium',
        status: 'Cancelled',
        startDate: daysAgo(32),
        dueDate: daysAgo(22),
      },
    ];

    await Task.insertMany(tasksToInsert);
    // Update counter to 40
    await Counter.findOneAndUpdate({ id: 'taskId' }, { seq: 40 });

    console.log(`Successfully seeded ${tasksToInsert.length} tasks!`);
    console.log('Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
