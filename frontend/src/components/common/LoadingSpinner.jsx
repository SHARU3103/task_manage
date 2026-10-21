import React from 'react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-600 mb-3"></div>
      <p className="text-gray-500 text-sm font-medium">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
