import React from 'react';

const PriorityBadge = ({ priority }) => {
  const config = {
    'Low': 'bg-slate-100 text-slate-700 border-slate-200',
    'Medium': 'bg-blue-50 text-blue-700 border-blue-200',
    'High': 'bg-orange-50 text-orange-700 border-orange-300 font-medium',
    'Critical': 'bg-red-100 text-red-800 border-red-300 font-semibold',
  }[priority] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${config}`}>
      {priority}
    </span>
  );
};

export default PriorityBadge;
