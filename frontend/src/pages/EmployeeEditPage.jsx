import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeApi } from '../api/employeeApi';
import EmployeeForm from '../components/employees/EmployeeForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import NotificationToast from '../components/common/NotificationToast';

const EmployeeEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const res = await employeeApi.getEmployeeById(id);
        setEmployee(res.data);
      } catch (err) {
        setServerError(err.message || 'Employee not found');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);
      await employeeApi.updateEmployee(id, formData);

      setNotification({
        type: 'success',
        message: 'Employee updated successfully!',
      });

      setTimeout(() => {
        navigate('/employees');
      }, 1000);
    } catch (err) {
      console.error('Update employee failed:', err);
      setServerError(err.message || 'Failed to update employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading employee details..." />;
  }

  if (!employee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorAlert message={serverError || 'Employee not found'} />
        <button
          onClick={() => navigate('/employees')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Back to Employees
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            Edit Employee: {employee.fullName} ({employee.employeeId})
          </h1>
          <span className="text-xs text-gray-400">ID: {employee.employeeId}</span>
        </div>

        <div className="p-6">
          <EmployeeForm
            initialData={employee}
            isEdit={true}
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

export default EmployeeEditPage;
