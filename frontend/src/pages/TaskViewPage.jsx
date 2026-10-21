import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { taskApi } from '../api/taskApi';
import PriorityBadge from '../components/common/PriorityBadge';
import StatusBadge from '../components/common/StatusBadge';
import StatusDropdown from '../components/tasks/StatusDropdown';
import ConfirmModal from '../components/common/ConfirmModal';
import NotificationToast from '../components/common/NotificationToast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import {
  Calendar,
  Clock,
  User,
  Building2,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Edit2,
  Trash2,
} from 'lucide-react';

const TaskViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await taskApi.getTaskById(id);
      setTask(res.data);
    } catch (err) {
      setError(err.message || 'Task not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setIsUpdating(true);
      const res = await taskApi.updateTaskStatus(taskId, newStatus);
      setTask(res.data);
      setNotification({
        type: 'success',
        message: `Task status updated to ${newStatus}`,
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Status transition failed',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await taskApi.deleteTask(id);
      navigate('/tasks');
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to delete task',
      });
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading task details..." />;
  }

  if (error || !task) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorAlert message={error || 'Task not found'} />
        <Link
          to="/tasks"
          className="inline-flex items-center text-sm text-blue-600 hover:underline mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Tasks
        </Link>
      </div>
    );
  }

  const employee = task.assignedEmployee || task.assignedEmployeeSnapshot || {};
  const isEditable = task.status !== 'Completed' && task.status !== 'Cancelled';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/tasks"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Task List
        </Link>

        <div className="flex items-center space-x-2">
          {isEditable && (
            <Link
              to={`/tasks/${task._id}/edit`}
              className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded shadow-sm transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1" />
              Edit Task
            </Link>
          )}
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

      {/* Overdue Banner if overdue */}
      {task.isOverdue && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-red-800">Task is Overdue!</h4>
            <p className="text-xs text-red-700">
              This task was due on {new Date(task.dueDate).toLocaleDateString()} and is still in{' '}
              <span className="font-semibold">{task.status}</span> status.
            </p>
          </div>
        </div>
      )}

      {/* Main Task Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Card Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <span className="px-2.5 py-0.5 rounded bg-gray-200 text-gray-800 text-xs font-bold font-mono">
              {task.taskId}
            </span>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500">Change Status:</span>
              <StatusDropdown
                task={task}
                onStatusChange={handleStatusChange}
                isUpdating={isUpdating}
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Description
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded border border-gray-100">
              {task.description || 'No description provided for this task.'}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <div>
              <span className="text-xs text-gray-500 block mb-1">Priority</span>
              <PriorityBadge priority={task.priority} />
            </div>

            <div>
              <span className="text-xs text-gray-500 block mb-1">Department</span>
              <span className="inline-flex items-center text-sm font-medium text-gray-800">
                <Building2 className="w-4 h-4 mr-1 text-gray-400" />
                {task.department}
              </span>
            </div>

            <div>
              <span className="text-xs text-gray-500 block mb-1">Start Date</span>
              <span className="inline-flex items-center text-sm font-medium text-gray-800">
                <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                {new Date(task.startDate).toLocaleDateString()}
              </span>
            </div>

            <div>
              <span className="text-xs text-gray-500 block mb-1">Due Date</span>
              <span
                className={`inline-flex items-center text-sm font-medium ${
                  task.isOverdue ? 'text-red-600 font-bold' : 'text-gray-800'
                }`}
              >
                <Clock className="w-4 h-4 mr-1 text-gray-400" />
                {new Date(task.dueDate).toLocaleDateString()}
                {task.isOverdue && ' (Overdue)'}
              </span>
            </div>
          </div>

          {/* Completion details if completed */}
          {task.completedDate && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded flex items-center space-x-2 text-xs text-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>
                Completed on <strong className="font-semibold">{new Date(task.completedDate).toLocaleString()}</strong>
              </span>
            </div>
          )}

          {/* Assigned Employee Section */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Assigned Employee Details
            </h3>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                  {employee.fullName ? employee.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {employee.fullName || 'Unknown Employee'}
                  </h4>
                  <p className="text-xs text-gray-500">{employee.email || 'N/A'}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {employee.role || 'Role N/A'} • {employee.department || 'Dept N/A'}
                  </p>
                </div>
              </div>

              {employee._id && (
                <Link
                  to={`/employees/${employee._id}`}
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded text-xs font-medium text-center shadow-sm"
                >
                  View Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Task"
        message={`Are you sure you want to delete task "${task.taskId}: ${task.title}"?`}
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

export default TaskViewPage;
