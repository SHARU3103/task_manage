import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskApi } from '../api/taskApi';
import TaskForm from '../components/tasks/TaskForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import NotificationToast from '../components/common/NotificationToast';

const TaskEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const res = await taskApi.getTaskById(id);
        setTask(res.data);
      } catch (err) {
        setServerError(err.message || 'Task not found');
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);
      await taskApi.updateTask(id, formData);

      setNotification({
        type: 'success',
        message: 'Task updated successfully!',
      });

      setTimeout(() => {
        navigate('/tasks');
      }, 1000);
    } catch (err) {
      console.error('Task update failed:', err);
      setServerError(err.message || 'Failed to update task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading task details..." />;
  }

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorAlert message={serverError || 'Task not found'} />
        <button
          onClick={() => navigate('/tasks')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  // Business Rule check: Completed and Cancelled tasks cannot be edited
  if (task.status === 'Completed' || task.status === 'Cancelled') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center animate-fade-in">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Task Cannot Be Edited</h2>
          <p className="text-gray-600 text-sm mb-6">
            This task has status <span className="font-semibold text-gray-900">"{task.status}"</span>.
            Under business rules, completed and cancelled tasks are locked and cannot be edited.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => navigate(`/tasks/${task._id}`)}
              className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
            >
              View Task Details
            </button>
            <button
              onClick={() => navigate('/tasks')}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Back to Tasks
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Task: {task.taskId}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Status can only be modified via status workflow.</p>
          </div>
          <span className="text-xs text-gray-400">ID: {task.taskId}</span>
        </div>

        <div className="p-6">
          <TaskForm
            initialData={task}
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

export default TaskEditPage;
