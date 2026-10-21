import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorAlert = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded text-sm flex items-start justify-between shadow-sm my-4">
      <div className="flex items-center space-x-2">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <span className="font-medium">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="text-red-500 hover:text-red-700 font-bold ml-2 focus:outline-none"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
