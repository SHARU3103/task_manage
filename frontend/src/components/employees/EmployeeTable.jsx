import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Eye, Edit2, Trash2 } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const EmployeeActionMenu = ({ employee, onDeleteClick }) => {
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
              to={`/employees/${employee._id}`}
              className="flex items-center px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 font-medium"
              onClick={() => setIsOpen(false)}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              View
            </Link>

            <Link
              to={`/employees/${employee._id}/edit`}
              className="flex items-center px-3 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 font-medium"
              onClick={() => setIsOpen(false)}
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Edit
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onDeleteClick(employee);
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

const EmployeeTable = ({ employees, onDeleteClick }) => {
  if (!employees || employees.length === 0) {
    return (
      <div className="bg-white p-12 text-center text-gray-500">
        <p className="text-base font-medium">No employees found matching your filters.</p>
        <p className="text-xs text-gray-400 mt-1">Try resetting filters or adding a new employee.</p>
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
              Full Name
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold tracking-wider text-xs uppercase">
              Department
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold tracking-wider text-xs uppercase">
              Role
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold tracking-wider text-xs uppercase">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold tracking-wider text-xs uppercase">
              Active Tasks
            </th>
            <th scope="col" className="px-4 py-3 text-center font-semibold tracking-wider text-xs uppercase w-20">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {employees.map((emp) => {
            const activeCount = emp.activeTasksCount || 0;
            const isAtCapacity = activeCount >= 3;

            return (
              <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                  <Link to={`/employees/${emp._id}`} className="hover:text-blue-600 hover:underline">
                    {emp.employeeId}
                  </Link>
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  <Link to={`/employees/${emp._id}`} className="font-medium text-gray-900 hover:text-blue-600">
                    {emp.fullName}
                  </Link>
                  <p className="text-xs text-gray-500">{emp.email}</p>
                </td>

                <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                  {emp.department}
                </td>

                <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                  {emp.role}
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={emp.status} type="employee" />
                  {emp.status === 'On Leave' && emp.leaveStartDate && emp.leaveEndDate && (
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      {new Date(emp.leaveStartDate).toLocaleDateString()} - {new Date(emp.leaveEndDate).toLocaleDateString()}
                    </p>
                  )}
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      isAtCapacity
                        ? 'bg-red-100 text-red-800 font-semibold'
                        : activeCount > 0
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {activeCount} / 3 active
                  </span>
                </td>

                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <EmployeeActionMenu employee={emp} onDeleteClick={onDeleteClick} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
