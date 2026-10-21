import React from 'react';

const StatCard = ({ title, value, colorClass = 'text-gray-900', subtitle, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-4 border border-gray-200 shadow-sm transition-all ${
        onClick ? 'cursor-pointer hover:shadow hover:border-gray-300' : ''
      }`}
    >
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {title}
      </p>
      <p className={`text-2xl sm:text-3xl font-bold ${colorClass}`}>
        {value !== undefined ? value : '-'}
      </p>
      {subtitle && <p className="text-[11px] text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
