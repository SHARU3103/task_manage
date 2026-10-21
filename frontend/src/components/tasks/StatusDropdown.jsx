import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Clock, Play } from 'lucide-react';

const VALID_TRANSITIONS = {
  'Todo': ['In Progress', 'Cancelled'],
  'In Progress': ['Completed', 'Cancelled'],
  'Completed': [],
  'Cancelled': [],
};

const STATUS_STYLES = {
  'Todo': 'bg-gray-600 hover:bg-gray-700 text-white',
  'In Progress': 'bg-[#2b6cb0] hover:bg-[#2c5282] text-white',
  'Completed': 'bg-[#2f855a] text-white',
  'Cancelled': 'bg-[#9b2c2c] text-white',
};

const StatusDropdown = ({ task, onStatusChange, isUpdating }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentStatus = task.status;
  const validNextStatuses = VALID_TRANSITIONS[currentStatus] || [];
  const isFinalStatus = validNextStatuses.length === 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newStatus) => {
    setIsOpen(false);
    if (newStatus !== currentStatus) {
      onStatusChange(task._id, newStatus);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Todo':
        return <Clock className="w-3.5 h-3.5 mr-1" />;
      case 'In Progress':
        return <Play className="w-3.5 h-3.5 mr-1 fill-current" />;
      case 'Completed':
        return <Check className="w-3.5 h-3.5 mr-1" />;
      case 'Cancelled':
        return <X className="w-3.5 h-3.5 mr-1" />;
      default:
        return null;
    }
  };

  // If Completed or Cancelled, it's locked and cannot be changed
  if (isFinalStatus) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold select-none cursor-default shadow-sm ${
          STATUS_STYLES[currentStatus]
        }`}
        title={`${currentStatus} tasks cannot be modified`}
      >
        {getStatusIcon(currentStatus)}
        {currentStatus}
      </span>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        disabled={isUpdating}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between px-2.5 py-1 rounded text-xs font-semibold shadow-sm focus:outline-none transition-colors ${
          STATUS_STYLES[currentStatus]
        } ${isUpdating ? 'opacity-70 cursor-wait' : 'cursor-pointer'}`}
      >
        <span className="flex items-center">
          {getStatusIcon(currentStatus)}
          {currentStatus}
        </span>
        <ChevronDown className="w-3.5 h-3.5 ml-1" />
      </button>

      {isOpen && (
        <div className="origin-top-left absolute left-0 mt-1 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-30 py-1 divide-y divide-gray-100">
          <div className="px-3 py-1.5 text-[11px] text-gray-400 font-medium uppercase tracking-wider">
            Next Status:
          </div>
          <div className="py-1">
            {validNextStatuses.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => handleSelect(status)}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
              >
                {getStatusIcon(status)}
                <span className="font-medium">{status}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;
