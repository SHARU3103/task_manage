import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorAlert from '../common/ErrorAlert';

const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];
const STATUSES = ['Active', 'Inactive', 'On Leave'];

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

const EmployeeForm = ({ initialData, isEdit = false, onSubmit, isSubmitting, serverError, onClearError }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeId: initialData?.employeeId || '',
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    department: initialData?.department || 'Development',
    role: initialData?.role || '',
    joiningDate: formatDateForInput(initialData?.joiningDate) || '',
    status: initialData?.status || 'Active',
    skills: Array.isArray(initialData?.skills) ? initialData.skills.join(', ') : initialData?.skills || '',
    leaveStartDate: formatDateForInput(initialData?.leaveStartDate) || '',
    leaveEndDate: formatDateForInput(initialData?.leaveEndDate) || '',
  });

  const [clientErrors, setClientErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError && onClearError) {
      onClearError();
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.employeeId.trim()) errors.employeeId = 'Employee ID is required';
    if (!formData.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.role.trim()) errors.role = 'Role is required';
    if (!formData.joiningDate) errors.joiningDate = 'Joining Date is required';

    if (formData.status === 'On Leave') {
      if (!formData.leaveStartDate) errors.leaveStartDate = 'Leave Start Date is required when On Leave';
      if (!formData.leaveEndDate) errors.leaveEndDate = 'Leave End Date is required when On Leave';
      if (formData.leaveStartDate && formData.leaveEndDate) {
        const start = new Date(formData.leaveStartDate);
        const end = new Date(formData.leaveEndDate);
        if (end < start) {
          errors.leaveEndDate = 'Leave End Date cannot be earlier than Leave Start Date';
        }
      }
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Convert comma-separated skills to array
    const submissionData = {
      ...formData,
      skills: formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employee ID */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Employee ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            placeholder="e.g. EMP-001"
            className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              clientErrors.employeeId ? 'border-red-400 bg-red-50/30' : 'border-gray-300'
            }`}
          />
          {clientErrors.employeeId && (
            <p className="text-red-500 text-xs mt-1">{clientErrors.employeeId}</p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter Full Name"
            className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              clientErrors.fullName ? 'border-red-400 bg-red-50/30' : 'border-gray-300'
            }`}
          />
          {clientErrors.fullName && (
            <p className="text-red-500 text-xs mt-1">{clientErrors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Email (unique, normalized) <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. user@example.com"
            className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              clientErrors.email ? 'border-red-400 bg-red-50/30' : 'border-gray-300'
            }`}
          />
          {clientErrors.email && (
            <p className="text-red-500 text-xs mt-1">{clientErrors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. +91 98765 43210"
            className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              clientErrors.phone ? 'border-red-400 bg-red-50/30' : 'border-gray-300'
            }`}
          />
          {clientErrors.phone && (
            <p className="text-red-500 text-xs mt-1">{clientErrors.phone}</p>
          )}
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
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="e.g. Senior Full Stack Developer"
            className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              clientErrors.role ? 'border-red-400 bg-red-50/30' : 'border-gray-300'
            }`}
          />
          {clientErrors.role && (
            <p className="text-red-500 text-xs mt-1">{clientErrors.role}</p>
          )}
        </div>

        {/* Joining Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Joining Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="joiningDate"
            value={formData.joiningDate}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              clientErrors.joiningDate ? 'border-red-400 bg-red-50/30' : 'border-gray-300'
            }`}
          />
          {clientErrors.joiningDate && (
            <p className="text-red-500 text-xs mt-1">{clientErrors.joiningDate}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conditional Leave Dates (only when On Leave!) */}
      {formData.status === 'On Leave' && (
        <div className="bg-amber-50 border border-amber-200 rounded p-4 space-y-4 animate-fade-in">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
            Leave Period Details (Required when On Leave)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Leave Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="leaveStartDate"
                value={formData.leaveStartDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  clientErrors.leaveStartDate ? 'border-red-400 bg-red-50' : 'border-amber-300'
                }`}
              />
              {clientErrors.leaveStartDate && (
                <p className="text-red-600 text-xs mt-1">{clientErrors.leaveStartDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Leave End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="leaveEndDate"
                value={formData.leaveEndDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  clientErrors.leaveEndDate ? 'border-red-400 bg-red-50' : 'border-amber-300'
                }`}
              />
              {clientErrors.leaveEndDate && (
                <p className="text-red-600 text-xs mt-1">{clientErrors.leaveEndDate}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Skills */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          Skills (comma-separated)
        </label>
        <input
          type="text"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          placeholder="e.g. React, Node.js, MongoDB, TypeScript, Figma"
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">Enter skills separated by commas</p>
      </div>

      {/* Backend Error Banner */}
      {serverError && (
        <ErrorAlert message={serverError} onClose={onClearError} />
      )}

      {/* Form Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => navigate('/employees')}
          className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 bg-[#a33b3b] hover:bg-[#8b2f2f] text-white text-sm font-semibold rounded shadow-sm focus:outline-none disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Employee' : 'Add Employee'}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
