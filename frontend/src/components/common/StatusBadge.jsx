import React from 'react';

const StatusBadge = ({ status, type = 'task' }) => {
  if (type === 'task') {
    const config = {
      'Todo': 'bg-gray-600 text-white',
      'In Progress': 'bg-[#2b6cb0] text-white',
      'Completed': 'bg-[#2f855a] text-white',
      'Cancelled': 'bg-[#9b2c2c] text-white',
    }[status] || 'bg-gray-500 text-white';

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold ${config}`}>
        {status}
      </span>
    );
  }

  // Employee status
  const employeeConfig = {
    'Active': 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    'Inactive': 'bg-gray-100 text-gray-700 border border-gray-300',
    'On Leave': 'bg-amber-100 text-amber-800 border border-amber-300',
  }[status] || 'bg-gray-100 text-gray-800 border border-gray-300';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employeeConfig}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
