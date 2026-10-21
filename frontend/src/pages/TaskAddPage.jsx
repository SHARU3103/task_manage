import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskApi } from '../api/taskApi';
import TaskForm from '../components/tasks/TaskForm';
import NotificationToast from '../components/common/NotificationToast';

const TaskAddPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [notification, setNotification] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);
      const res = await taskApi.createTask(formData);

      setNotification({
        type: 'success',
        message: `Task ${res.data.taskId} created successfully!`,
      });

      // Redirect back to task list after brief moment
      setTimeout(() => {
        navigate('/tasks');
      }, 1000);
    } catch (err) {
      console.error('Task creation failed:', err);
      // Show backend error banner (matches image 3: "Employee already has 3 active tasks...")
      setServerError(err.message || 'Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header matching Image 3 */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 text-center">Add Task</h1>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <TaskForm
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

export default TaskAddPage;
