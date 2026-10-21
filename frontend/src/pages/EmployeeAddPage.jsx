import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeApi } from '../api/employeeApi';
import EmployeeForm from '../components/employees/EmployeeForm';
import NotificationToast from '../components/common/NotificationToast';

const EmployeeAddPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [notification, setNotification] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);
      const res = await employeeApi.createEmployee(formData);

      setNotification({
        type: 'success',
        message: `Employee ${res.data.fullName} created successfully!`,
      });

      setTimeout(() => {
        navigate('/employees');
      }, 1000);
    } catch (err) {
      console.error('Failed to create employee:', err);
      setServerError(err.message || 'Failed to create employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 text-center">Add New Employee</h1>
        </div>

        <div className="p-6">
          <EmployeeForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            serverError={serverError}
            onClearError={() => setServerError(null)}
          />
        </div>
      </div>

      <NotificationToast
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default EmployeeAddPage;
