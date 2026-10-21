import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const NotificationToast = ({ notification, onClose }) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const { type = 'info', message } = notification;

  const config = {
    success: {
      bg: 'bg-emerald-50 border-emerald-300 text-emerald-800',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    },
    error: {
      bg: 'bg-red-50 border-red-300 text-red-800',
      icon: <XCircle className="w-5 h-5 text-red-600" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-300 text-amber-800',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-300 text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-600" />,
    },
  }[type] || {
    bg: 'bg-gray-50 border-gray-300 text-gray-800',
    icon: <Info className="w-5 h-5 text-gray-600" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-fade-in shadow-lg">
      <div className={`flex items-start p-3 border rounded-lg ${config.bg}`}>
        <div className="flex-shrink-0 mr-3 mt-0.5">{config.icon}</div>
        <div className="text-sm font-medium mr-2">{message}</div>
        <button
          onClick={onClose}
          className="ml-auto text-gray-400 hover:text-gray-600 p-0.5 rounded focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
