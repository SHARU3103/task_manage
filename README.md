# Employee & Task Management System (MERN Stack)

A production-grade **Employee & Task Management System** developed with **React (Tailwind CSS)**, **Node.js + Express**, and **MongoDB (Mongoose)**. The application enforces business logic, role-based scheduling, workload capacity limits, auditability, and synchronized URL state management.

---

## 📋 Table of Contents
1. [Tech Stack](#-tech-stack)
2. [Folder Structure](#-folder-structure)
3. [Key Features & Business Rules](#-key-features--business-rules)
4. [Environment Variables](#-environment-variables)
5. [Installation & Setup](#-installation--setup)
6. [Database Seeding & Test Suite](#-database-seeding--test-suite)
7. [API Documentation](#-api-documentation)
8. [Schema & Entity Relationships](#-schema--entity-relationships)
9. [How Employee Deletion is Handled](#-how-employee-deletion-is-handled)
10. [Assumptions Made](#-assumptions-made)
11. [Answers to Required Technical Questions](#-answers-to-required-technical-questions)
12. [Deployment Guide](#-deployment-guide)

---

## 💻 Tech Stack
- **Frontend**: React 18, React Router DOM v6, Tailwind CSS, Lucide React, Axios, Vite.
- **Backend**: Node.js, Express.js, Mongoose (MongoDB ODM), Morgan, CORS, Dotenv.
- **Database**: MongoDB (Local or MongoDB Atlas).

---

## 📁 Folder Structure
```
Employee & Task Management System/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection setup
│   │   ├── controllers/
│   │   │   ├── employeeController.js # Employee CRUD & validation
│   │   │   ├── taskController.js     # Task CRUD, status workflow & CSV export
│   │   │   └── dashboardController.js# Aggregated stats & employee workload
│   │   ├── models/
│   │   │   ├── Employee.js           # Employee Mongoose schema
│   │   │   ├── Task.js               # Task Mongoose schema & overdue virtual
│   │   │   └── Counter.js            # Atomic sequence counter for TSK-001
│   │   ├── routes/
│   │   │   ├── employeeRoutes.js     # /api/employees routes
│   │   │   ├── taskRoutes.js         # /api/tasks routes
│   │   │   └── dashboardRoutes.js    # /api/dashboard routes
│   │   ├── middleware/
│   │   │   └── errorHandler.js       # Centralized 400, 404, 409 & 500 handler
│   │   ├── utils/
│   │   │   ├── businessRules.js      # Core business rule validation logic
│   │   │   └── csvExporter.js        # RFC 4180 compliant CSV generator
│   │   ├── seed/
│   │   │   └── seedData.js           # 12 employees & 40 tasks mirroring mockup
│   │   ├── tests/
│   │   │   └── businessRules.test.js # Automated verification test suite
│   │   └── server.js                 # Express application entrypoint
│   ├── .env
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js             # Axios instance & error interceptor
│   │   │   ├── employeeApi.js        # Employee endpoints
│   │   │   ├── taskApi.js            # Task endpoints, status & CSV blob download
│   │   │   └── dashboardApi.js       # Dashboard stats endpoint
│   │   ├── components/
│   │   │   ├── common/               # Navbar, Pagination, Badges, Modals, Toasts
│   │   │   ├── tasks/                # TaskFilterBar, TaskTable, StatusDropdown, TaskForm
│   │   │   ├── employees/            # EmployeeFilterBar, EmployeeTable, EmployeeForm
│   │   │   └── dashboard/            # StatCard, WorkloadTable
│   │   ├── pages/                    # Dashboard, List, Add, Edit, View pages
│   │   ├── App.jsx                   # React Router setup
│   │   ├── main.jsx                  # React DOM root
│   │   └── index.css                 # Tailwind directives
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── package.json                      # Monorepo convenience scripts
└── README.md
```

---

## ⚙️ Key Features & Business Rules
The backend strictly enforces the following business logic:
1. **Assignment Rules**:
   - Tasks can be assigned **only to Active employees**.
   - Assigning to an **Inactive** employee is always rejected with HTTP 400.
   - Assigning to an **On Leave** employee is rejected with HTTP 400 if the task's `startDate` falls inside their leave period (inclusive: `leaveStartDate <= task.startDate <= leaveEndDate`).
2. **Date Validation**:
   - `dueDate` cannot be earlier than `startDate` (`dueDate >= startDate`).
3. **Status Workflow Engine**:
   - Allowed transitions:
     - `Todo` ➔ `In Progress`
     - `In Progress` ➔ `Completed`
     - `Todo` ➔ `Cancelled`
     - `In Progress` ➔ `Cancelled`
   - Any other transition is rejected with HTTP 400.
   - New tasks **always** start as `Todo`.
   - Task status **cannot** be modified through the normal `PUT /api/tasks/:id` endpoint. It can only be changed via `PUT /api/tasks/:id/status`.
   - **Completed and Cancelled tasks cannot be edited**.
4. **Completed Date Integrity**:
   - Set automatically by the backend when a task enters `Completed` status. Never accepted from the frontend.
5. **Workload Capacity**:
   - One employee can hold **at most 3 active tasks** (`Todo` + `In Progress`) at a time.
   - Assigning a 4th active task is rejected with HTTP 400: `"Employee already has 3 active tasks. Please choose another employee."`
6. **Consistent Overdue Computation**:
   - Overdue when: `currentDate > dueDate` AND status is **neither Completed nor Cancelled**.
   - Reflected consistently in Task lists, details, Dashboard metrics, and CSV export.
7. **Safe Employee Deletion & Historical Integrity**:
   - Deleting an employee with `Todo` or `In Progress` tasks is strictly blocked (HTTP 400).
   - Old completed/cancelled tasks preserve a snapshot of the employee's details (`assignedEmployeeSnapshot`) even if the employee is later deleted or soft-deleted.
8. **URL State Synchronization**:
   - Search query, filters, sorting, and pagination page numbers live directly in URL query parameters (e.g. `/tasks?status=In%20Progress&priority=High&page=2`), allowing bookmarked and shared links to restore the exact view.

---

## 🔑 Environment Variables

### Backend `.env`
Create `backend/.env` (or copy from `backend/.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/employee_task_management
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`
In development, the Vite proxy forwards `/api` requests to `http://localhost:5000`. Production builds use `https://task-manage-0mgg.onrender.com/api` from `frontend/.env.production` by default. To use a different backend, set `VITE_API_URL` to its `/api` URL:
```env
VITE_API_URL=https://task-manage-0mgg.onrender.com/api
```

---

## 🚀 Installation & Setup

### 1. Prerequisites
- **Node.js** (v18.x or v20+ recommended)
- **MongoDB** running locally on port 27017 (or MongoDB Atlas connection string in `backend/.env`)

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend starts on **http://localhost:5000**.

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Frontend starts on **http://localhost:5173**.

---

## 🧪 Database Seeding & Test Suite

### 1. Populate Sample Data
The repository includes a seed script that creates 12 employees (8 Active, 2 Inactive, 2 On Leave) and 40 tasks matching the numbers in the assignment mockups:
```bash
cd backend
npm run seed
```

### 2. Run Automated Business Rule Tests
Run the automated test suite verifying all 20 business logic rules:
```bash
cd backend
npm test
```
**Test Results:**
```
--- Starting Business Rules Test Suite ---
PASS: Rule: Due Date earlier than Start Date is rejected
PASS: Rule: Due Date after Start Date is allowed
PASS: Rule: Due Date equal to Start Date is allowed
PASS: Rule: Task assignment to Inactive employee is always rejected
PASS: Rule: Task assignment to On Leave employee inside leave window is rejected
PASS: Rule: Task assignment to On Leave employee outside leave window is allowed
PASS: Rule: Todo -> In Progress is allowed
PASS: Rule: In Progress -> Completed is allowed
PASS: Rule: Todo -> Cancelled is allowed
PASS: Rule: In Progress -> Cancelled is allowed
PASS: Rule: Todo -> Completed directly is rejected
PASS: Rule: Completed -> In Progress is rejected
PASS: Rule: Completed -> Cancelled is rejected
PASS: Rule: Cancelled -> Todo is rejected
PASS: Rule: Cancelled -> Completed is rejected
PASS: Rule: Employee with 3 active tasks cannot be assigned a 4th active task
PASS: Rule: Past due date on In Progress task is Overdue
PASS: Rule: Future due date on In Progress task is NOT Overdue
PASS: Rule: Completed task is NEVER Overdue even if due date was in past
PASS: Rule: Cancelled task is NEVER Overdue even if due date was in past

Test Suite Summary: 20 Passed, 0 Failed
```

---

## 📡 API Documentation

### Employee Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/employees` | List employees with pagination, search, filters & workload count |
| `GET` | `/api/employees/:id` | View single employee and assigned tasks |
| `POST` | `/api/employees` | Create employee (checks unique ID & unique email) |
| `PUT` | `/api/employees/:id` | Update employee details |
| `DELETE` | `/api/employees/:id` | Delete employee (blocked if active tasks exist) |

### Task Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | List tasks with pagination, server-side filtering & sorting |
| `GET` | `/api/tasks/export` | Download RFC 4180 CSV matching current filters |
| `GET` | `/api/tasks/:id` | View single task details |
| `POST` | `/api/tasks` | Create task (starts as `Todo`, validates capacity & leave) |
| `PUT` | `/api/tasks/:id` | Update task details (**status changes blocked here**) |
| `PUT` | `/api/tasks/:id/status`| Dedicated status update endpoint (`Todo` ➔ `In Progress` ➔ `Completed`, etc.) |
| `DELETE` | `/api/tasks/:id` | Delete task |

### Dashboard Endpoint
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Aggregated employee & task metrics, overdue count, and workload list |

---

## 🗄️ Schema & Entity Relationships

```
 ┌─────────────────────────────────────────┐
 │                Employee                 │
 ├─────────────────────────────────────────┤
 │ _id: ObjectId                           │
 │ employeeId: String (Unique, Indexed)    │
 │ fullName: String                        │
 │ email: String (Unique, Lowercased)      │
 │ phone: String                           │
 │ department: Enum (Development, etc.)    │
 │ role: String                            │
 │ joiningDate: Date                       │
 │ status: Enum (Active, Inactive, On Leave│
 │ skills: [String]                        │
 │ leaveStartDate: Date (Optional)         │
 │ leaveEndDate: Date (Optional)           │
 │ isDeleted: Boolean (Default: false)     │
 └──────────────────┬──────────────────────┘
                    │ 1 (Assignee)
                    │
                    │ M (Assigned tasks)
                    ▼
 ┌─────────────────────────────────────────┐
 │                  Task                   │
 ├─────────────────────────────────────────┤
 │ _id: ObjectId                           │
 │ taskId: String (Auto TSK-001, Unique)   │
 │ title: String                           │
 │ description: String                     │
 │ assignedEmployee: Ref -> Employee._id   │
 │ assignedEmployeeSnapshot: {             │
 │   employeeId, fullName, email, role     │
 │ }                                       │
 │ department: Enum                        │
 │ priority: Enum (Low, Medium, High, Crit)│
 │ status: Enum (Todo, In Progress, ...)   │
 │ startDate: Date                         │
 │ dueDate: Date                           │
 │ createdDate: Date                       │
 │ completedDate: Date (Managed by backend)│
 └─────────────────────────────────────────┘
```

---

## 🛡️ How Employee Deletion is Handled
1. **Pre-deletion Check**:
   - When `DELETE /api/employees/:id` is requested, the server counts tasks where `assignedEmployee == id` and `status IN ['Todo', 'In Progress']`.
   - If active tasks exist, the deletion is rejected with HTTP 400: `"Cannot delete employee: employee currently has X active task(s). Please reassign or complete these tasks first."`
2. **Soft Deletion & Snapshot Retention**:
   - If allowed, the employee is soft-deleted (`isDeleted = true, status = 'Inactive', deletedAt = new Date()`).
   - Every Task document also stores an immutable `assignedEmployeeSnapshot` (`employeeId`, `fullName`, `email`, `role`, `department`).
   - Even if an employee record is permanently purged, historical completed or cancelled tasks display the meaningful name and role of the employee who completed the work.

---

## 📌 Assumptions Made
1. **Departments**: Fixed to the 5 specified departments: `Development`, `Design`, `QA`, `HR`, and `Sales`.
2. **Priority Hierarchy**: Critical (Rank 4) > High (Rank 3) > Medium (Rank 2) > Low (Rank 1).
3. **Sequential Task IDs**: Generated atomically via a dedicated `Counter` collection (`TSK-001`, `TSK-002`, ...).
4. **Timezone & Date Inclusion**: Start and leave comparison dates are evaluated using normalized start-of-day and end-of-day boundaries to prevent timezone discrepancies.
5. **No Authentication Required**: As explicitly stated in the brief, the system does not require login or auth gates.

---

## ❓ Answers to Required Technical Questions

### 1. Where do you validate status transitions and why?
> **Answer**:
> Status transitions are validated **strictly on the backend inside a dedicated endpoint (`PUT /api/tasks/:id/status`)** and in a centralized helper (`isValidStatusTransition`).
>
> **Why?**
> - **Security & Business Rules**: If validation lived only in frontend dropdowns, any client could issue a `curl` or Postman request jumping straight from `Todo` to `Completed` or modifying already finalized/cancelled tasks.
> - **Separation of Concerns**: General metadata edits (e.g. updating task description) should never accidentally bypass the status workflow or overwrite timestamps. Keeping status transitions isolated in `PUT /api/tasks/:id/status` guarantees the transition matrix (`Todo` ➔ `In Progress` ➔ `Completed`, `Todo`/`In Progress` ➔ `Cancelled`) is checked atomically.

### 2. Why does Completed Date come from the backend?
> **Answer**:
> - **Tamper Prevention & Audit Trail**: The frontend client time cannot be trusted because client device clocks can be skewed, out of sync, or intentionally manipulated by users to hide SLA breaches.
> - **Enforced State Invariance**: By setting `task.completedDate = new Date()` on the server exclusively when the state transition from `In Progress` to `Completed` succeeds, we guarantee the completion timestamp is truthful, immutable, and consistent across all dashboard reports.

### 3. How do you block Inactive / On-Leave assignment?
> **Answer**:
> When a task is created or re-assigned, the backend queries the target employee record:
> 1. If `employee.status === 'Inactive'`, it rejects the request immediately with HTTP 400.
> 2. If `employee.status === 'On Leave'`, the backend checks the task's `startDate`:
>    - If `task.startDate >= employee.leaveStartDate && task.startDate <= employee.leaveEndDate` (both inclusive), the assignment is rejected with HTTP 400.
>    - If `task.startDate` falls outside the leave period, the assignment is permitted.

### 4. Why are filtering and pagination on the backend?
> **Answer**:
> - **Scalability & Performance**: Fetching an entire database collection of thousands of records to the browser wastes bandwidth, spikes client memory usage, and destroys mobile device responsiveness.
> - **Accuracy of Metrics**: When doing full-dataset operations such as calculating total match counts or exporting a CSV of all matching records, the database engine uses optimized B-tree indexes and aggregation pipelines rather than loading arbitrary datasets into JavaScript memory.

### 5. Why do filters live in the URL?
> **Answer**:
> - **Shareability & Deep Linking**: Query parameters (`/tasks?status=In%20Progress&priority=High&page=2`) allow users to copy and share exact views with colleagues, or bookmark filtered views for daily standup reviews.
> - **Browser History & Reload Preservation**: Hitting browser refresh or using the Back/Forward buttons retains the user's active page, search terms, and selected dropdown filters without losing context.

### 6. What can go wrong if two requests assign a 4th active task at the same time?
> **Answer**:
> - **The Problem (Race Condition / TOCTOU - Time-Of-Check to Time-Of-Use)**:
>   Suppose an employee currently has 2 active tasks. Two task creation requests ($R_1$ and $R_2$) for this employee arrive concurrently at the same millisecond. Both requests read the database simultaneously and count 2 active tasks ($2 < 3$, check passes). Both requests proceed to insert their task. As a result, the employee ends up with 4 active tasks, violating the hard capacity limit.
>
> - **How to Solve / Mitigate**:
>   1. **MongoDB Multi-Document Transactions**: Wrap the capacity count and task insertion inside an ACID transaction with appropriate isolation (`session.startTransaction()`).
>   2. **Atomic Counter / Guard**: Maintain an `activeTasksCount` integer on the Employee document and perform an atomic increment with condition:
>      ```javascript
>      const res = await Employee.findOneAndUpdate(
>        { _id: employeeId, status: 'Active', activeTasksCount: { $lt: 3 } },
>        { $inc: { activeTasksCount: 1 } }
>      );
>      if (!res) throw new Error("Employee already has 3 active tasks.");
>      ```
>   3. **Distributed Locks**: Use Redis-based distributed locks (`Redlock`) around employee task assignment critical sections.

---

## 🌐 Deployment Guide

### Deploy Backend (Render / Railway / Heroku)
1. Push code to a GitHub repository.
2. In Render, create a new **Web Service** pointing to the `backend` directory.
3. Build command: `npm install`
4. Start command: `node src/server.js`
5. Configure environment variables (`MONGODB_URI`, `PORT`, `NODE_ENV=production`, `CLIENT_URL`).

### Deploy Frontend (Vercel / Netlify)
1. In Vercel or Netlify, create a new project pointing to the `frontend` directory.
2. Build command: `npm run build`
3. Output directory: `dist`
4. The production build uses `https://task-manage-0mgg.onrender.com/api` by default. If you use another backend, set `VITE_API_URL` in your frontend hosting settings to that backend's `/api` URL.
