import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Eye, Edit2, Trash2 } from 'lucide-react';
import PriorityBadge from '../common/PriorityBadge';
import StatusDropdown from './StatusDropdown';

// Format date to "05 Oct" format
const formatDisplayDate = (dateString, isOverdue) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';

  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });

  if (isOverdue) {
    return (
      <span className="text-red-600 font-semibold">
        {day} {month} (Overdue)
      </span>
    );
  }

  return (
    <span className="text-gray-700">
      {day} {month}
    </span>
  );
};

const TaskActionMenu = ({ task, onDeleteClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isEditable = task.status !== 'Completed' && task.status !== 'Cancelled';

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 focus:outline-none"
        title="Actions"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-1 w-28 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 py-1 divide-y divide-gray-100">
          <div className="py-1">
            <Link
              to={`/tasks/${task._id}`}
              className="flex items-center px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 font-medium"
              onClick={() => setIsOpen(false)}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              View
            </Link>

            {isEditable ? (
              <Link
                to={`/tasks/${task._id}/edit`}
                className="flex items-center px-3 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 font-medium"
                onClick={() => setIsOpen(false)}
              >
                <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Link>
            ) : (
              <span
                className="flex items-center px-3 py-1.5 text-xs text-gray-400 cursor-not-allowed select-none"
                title="Completed or Cancelled tasks cannot be edited"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onDeleteClick(task);
              }}
              className="flex items-center w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const TaskTable = ({ tasks, onStatusChange, onDeleteClick, updatingTaskId }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white p-12 text-center text-gray-500">
        <p className="text-base font-medium">No tasks found matching your filters.</p>
        <p className="text-xs text-gray-400 mt-1">Try resetting filters or adding a new task.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white shadow-sm border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-[#1f242b] text-white">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-semibold tracking-wider text-xs uppercase w-24">
              ID
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold tracking-wider text-xs uppercase">
              Title
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold tracking-wider text-xs uppercase">
              Employee
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold tracking-wider text-xs uppercase">
              Priority
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold tracking-wider text-xs uppercase">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold tracking-wider text-xs uppercase">
              Due Date
            </th>
            <th scope="col" className="px-4 py-3 text-center font-semibold tracking-wider text-xs uppercase w-20">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => {
            const employeeName =
              task.assignedEmployee?.fullName ||
              task.assignedEmployeeSnapshot?.fullName ||
              'Unassigned';

            return (
              <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                {/* Task ID */}
                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                  <Link to={`/tasks/${task._id}`} className="hover:text-blue-600 hover:underline">
                    {task.taskId}
                  </Link>
                </td>

                {/* Title */}
                <td className="px-4 py-3 text-gray-900 font-medium">
                  <Link to={`/tasks/${task._id}`} className="hover:text-blue-600 transition-colors">
                    {task.title}
                  </Link>
                  {task.description && (
                    <p className="text-xs text-gray-500 truncate max-w-xs">{task.description}</p>
                  )}
                </td>

                {/* Employee */}
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                  {task.assignedEmployee ? (
                    <Link
                      to={`/employees/${task.assignedEmployee._id || task.assignedEmployee}`}
                      className="hover:text-blue-600 hover:underline"
                    >
                      {employeeName}
                    </Link>
                  ) : (
                    <span>{employeeName}</span>
                  )}
                </td>

                {/* Priority */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <PriorityBadge priority={task.priority} />
                </td>

                {/* Status Dropdown */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusDropdown
                    task={task}
                    onStatusChange={onStatusChange}
                    isUpdating={updatingTaskId === task._id}
                  />
                </td>

                {/* Due Date with Overdue in bold red */}
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {formatDisplayDate(task.dueDate, task.isOverdue)}
                </td>

                {/* Action Menu */}
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <TaskActionMenu task={task} onDeleteClick={onDeleteClick} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
