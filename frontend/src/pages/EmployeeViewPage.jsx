import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { employeeApi } from '../api/employeeApi';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import ConfirmModal from '../components/common/ConfirmModal';
import NotificationToast from '../components/common/NotificationToast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  Briefcase,
  CheckCircle2,
  Clock,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';

const EmployeeViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await employeeApi.getEmployeeById(id);
      setEmployee(res.data);
    } catch (err) {
      setError(err.message || 'Employee not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const handleDelete = async () => {
    try {
      await employeeApi.deleteEmployee(id);
      navigate('/employees');
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to delete employee',
      });
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading employee profile..." />;
  }

  if (error || !employee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorAlert message={error || 'Employee not found'} />
        <Link
          to="/employees"
          className="inline-flex items-center text-sm text-blue-600 hover:underline mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Employees
        </Link>
      </div>
    );
  }

  const tasks = employee.tasks || [];
  const activeCount = employee.activeTasksCount || 0;
  const isAtCapacity = activeCount >= 3;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/employees"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Employee Directory
        </Link>

        <div className="flex items-center space-x-2">
          <Link
            to={`/tasks/add?assignedEmployee=${employee._id}`}
            className="inline-flex items-center px-3 py-1.5 bg-[#a33b3b] hover:bg-[#8b2f2f] text-white text-xs font-semibold rounded shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Assign Task
          </Link>
          <Link
            to={`/employees/${employee._id}/edit`}
            className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded shadow-sm transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 mr-1" />
            Edit Profile
          </Link>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded shadow-sm transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete
          </button>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-sm">
                {employee.fullName ? employee.fullName.charAt(0).toUpperCase() : 'E'}
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">{employee.fullName}</h1>
                  <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-800 text-xs font-mono font-semibold">
                    {employee.employeeId}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5 font-medium">
                  {employee.role} • <span className="text-gray-500">{employee.department}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:items-end">
              <StatusBadge status={employee.status} type="employee" />
              {employee.status === 'On Leave' && employee.leaveStartDate && employee.leaveEndDate && (
                <p className="text-xs text-amber-700 mt-1 font-medium">
                  On Leave: {new Date(employee.leaveStartDate).toLocaleDateString()} to{' '}
                  {new Date(employee.leaveEndDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 divide-x divide-gray-200 border-b border-gray-200 bg-white">
          <div className="p-4 text-center">
            <p className="text-xs text-gray-500 font-medium uppercase">Active Workload</p>
            <p
              className={`text-2xl font-bold mt-1 ${
                isAtCapacity ? 'text-red-600' : 'text-blue-600'
              }`}
            >
              {activeCount} <span className="text-sm font-normal text-gray-500">/ 3 max</span>
            </p>
            {isAtCapacity && (
              <span className="text-[11px] text-red-500 font-medium block">At Full Capacity</span>
            )}
          </div>

          <div className="p-4 text-center">
            <p className="text-xs text-gray-500 font-medium uppercase">Completed Tasks</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {employee.completedTasksCount || 0}
            </p>
          </div>

          <div className="p-4 text-center">
            <p className="text-xs text-gray-500 font-medium uppercase">Total Assigned</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {employee.totalTasksAssigned || 0}
            </p>
          </div>
        </div>

        {/* Contact and Metadata */}
        <div className="p-6 space-y-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Employee Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{employee.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{employee.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>Joined: {new Date(employee.joiningDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Skills */}
          {employee.skills && employee.skills.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500 block mb-2 font-medium">Skills:</span>
              <div className="flex flex-wrap gap-1.5">
                {employee.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assigned Tasks Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Task History</h3>
          <span className="text-xs text-gray-500">{tasks.length} total tasks</span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No tasks have been assigned to this employee yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-[#1f242b] text-white">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase">ID</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase">Title</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase">Priority</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-900 font-mono text-xs">
                      <Link to={`/tasks/${task._id}`} className="hover:text-blue-600 hover:underline">
                        {task.taskId}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-gray-900">
                      <Link to={`/tasks/${task._id}`} className="hover:text-blue-600">
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={task.status} type="task" />
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Employee"
        message={`Are you sure you want to delete ${employee.fullName}? If they have any active tasks, this will be rejected by backend rules.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <NotificationToast
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default EmployeeViewPage;
