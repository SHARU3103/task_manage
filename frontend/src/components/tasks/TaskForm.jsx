import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeApi } from '../../api/employeeApi';
import ErrorAlert from '../common/ErrorAlert';
import LoadingSpinner from '../common/LoadingSpinner';

const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

// Helper to convert date to YYYY-MM-DD for <input type="date" />
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

const TaskForm = ({ initialData, isEdit = false, onSubmit, isSubmitting, serverError, onClearError }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    assignedEmployee: initialData?.assignedEmployee?._id || initialData?.assignedEmployee || '',
    department: initialData?.department || '',
    priority: initialData?.priority || 'Medium',
    startDate: formatDateForInput(initialData?.startDate) || '',
    dueDate: formatDateForInput(initialData?.dueDate) || '',
    description: initialData?.description || '',
  });

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [clientErrors, setClientErrors] = useState({});

  // Fetch employees for dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Fetch up to 100 employees
        const res = await employeeApi.getEmployees({ limit: 100 });
        setEmployees(res.data || []);
      } catch (err) {
        console.error('Failed to load employees for task form:', err);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const nextData = { ...prev, [name]: value };
      // Auto-set department if employee is selected and department is empty
      if (name === 'assignedEmployee') {
        const emp = employees.find((e) => e._id === value);
        if (emp && !prev.department) {
          nextData.department = emp.department;
        }
      }
      return nextData;
    });

    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError && onClearError) {
      onClearError();
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.assignedEmployee) errors.assignedEmployee = 'Please select an employee';
    if (!formData.department) errors.department = 'Department is required';
    if (!formData.startDate) errors.startDate = 'Start Date is required';
    if (!formData.dueDate) errors.dueDate = 'Due Date is required';

    if (formData.startDate && formData.dueDate) {
      const start = new Date(formData.startDate);
      const due = new Date(formData.dueDate);
      if (due < start) {
        errors.dueDate = 'Due Date cannot be earlier than Start Date';
      }
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  if (loadingEmployees) {
    return <LoadingSpinner text="Loading form options..." />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter Title"
            className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              clientErrors.title ? 'border-red-400 bg-red-50/30' : 'border-gray-300'
            }`}
          />
          {clientErrors.title && <p className="text-red-500 text-xs mt-1">{clientErrors.title}</p>}
        </div>

        {/* Assigned Employee */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Assigned Employee <span className="text-red-500">*</span>
          </label>
          <select
            name="assignedEmployee"
            value={formData.assignedEmployee}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              clientErrors.assignedEmployee ? 'border-red-400 bg-red-50/30' : 'border-gray-300'
            }`}
          >
            <option value="">Select...</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.fullName} ({emp.employeeId}) - {emp.department} [{emp.status}]
                {emp.activeTasksCount !== undefined ? ` - ${emp.activeTasksCount} active tasks` : ''}
              </option>
            ))}
          </select>
          {clientErrors.assignedEmployee && (
            <p className="text-red-500 text-xs mt-1">{clientErrors.assignedEmployee}</p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Priority <span className="text-red-500">*</span>
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              clientErrors.department ? 'border-red-400 bg-red-50/30' : 'border-gray-300'
            }`}
          >
            <option value="">Select...</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {clientErrors.department && (
            <p className="text-red-500 text-xs mt-1">{clientErrors.department}</p>
          )}
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              clientErrors.startDate ? 'border-red-400 bg-red-50/30' : 'border-gray-300'
            }`}
          />
          {clientErrors.startDate && (
            <p className="text-red-500 text-xs mt-1">{clientErrors.startDate}</p>
          )}
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              clientErrors.dueDate ? 'border-red-400 bg-red-50/30' : 'border-gray-300'
            }`}
          />
          {clientErrors.dueDate && (
            <p className="text-red-500 text-xs mt-1">{clientErrors.dueDate}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          Description
        </label>
        <textarea
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter Description"
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        ></textarea>
      </div>

      {/* Backend Business Rule Error Banner (Matches Image 3) */}
      {serverError && (
        <ErrorAlert message={serverError} onClose={onClearError} />
      )}

      {/* Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => navigate('/tasks')}
          className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 bg-[#a33b3b] hover:bg-[#8b2f2f] text-white text-sm font-semibold rounded shadow-sm focus:outline-none disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
