import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { taskApi } from '../api/taskApi';
import TaskFilterBar from '../components/tasks/TaskFilterBar';
import TaskTable from '../components/tasks/TaskTable';
import Pagination from '../components/common/Pagination';
import ConfirmModal from '../components/common/ConfirmModal';
import NotificationToast from '../components/common/NotificationToast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TaskListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract filter parameters from URL
  const search = searchParams.get('search') || '';
  const department = searchParams.get('department') || 'All';
  const priority = searchParams.get('priority') || 'All';
  const status = searchParams.get('status') || 'All';
  const dueFrom = searchParams.get('dueFrom') || '';
  const dueTo = searchParams.get('dueTo') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '5', 10); // Display 5 per page like mockup image 3

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 5, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  // Fetch tasks using server-side filtering and pagination
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
      };
      if (search) params.search = search;
      if (department && department !== 'All') params.department = department;
      if (priority && priority !== 'All') params.priority = priority;
      if (status && status !== 'All') params.status = status;
      if (dueFrom) params.dueFrom = dueFrom;
      if (dueTo) params.dueTo = dueTo;

      const res = await taskApi.getTasks(params);
      setTasks(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to load tasks',
      });
    } finally {
      setLoading(false);
    }
  }, [search, department, priority, status, dueFrom, dueTo, page, limit]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Helper to update URL search params
  const updateUrlParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { ...current, ...newParams };

    // Remove empty or 'All' defaults to keep URL clean
    Object.keys(merged).forEach((key) => {
      if (!merged[key] || merged[key] === 'All' || (key === 'page' && merged[key] === 1)) {
        delete merged[key];
      }
    });

    setSearchParams(merged);
  };

  const handleFilterChange = (key, value) => {
    updateUrlParams({ [key]: value, page: 1 });
  };

  const handleSearch = (searchTerm) => {
    updateUrlParams({ search: searchTerm, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    updateUrlParams({ page: newPage });
  };

  // Status transition handling via dedicated PUT /api/tasks/:id/status
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setUpdatingTaskId(taskId);
      const res = await taskApi.updateTaskStatus(taskId, newStatus);
      setNotification({
        type: 'success',
        message: `Task status updated to ${newStatus}`,
      });
      // Update local state or refetch
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, ...res.data, isOverdue: res.data.isOverdue } : t))
      );
    } catch (err) {
      console.error('Status update failed:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to update status',
      });
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Delete task handling
  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    try {
      await taskApi.deleteTask(taskToDelete._id);
      setNotification({
        type: 'success',
        message: `Task ${taskToDelete.taskId} deleted successfully`,
      });
      setTaskToDelete(null);
      fetchTasks();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to delete task',
      });
    }
  };

  // Export CSV matching all current filters (not just current page)
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const exportParams = {};
      if (search) exportParams.search = search;
      if (department && department !== 'All') exportParams.department = department;
      if (priority && priority !== 'All') exportParams.priority = priority;
      if (status && status !== 'All') exportParams.status = status;
      if (dueFrom) exportParams.dueFrom = dueFrom;
      if (dueTo) exportParams.dueTo = dueTo;

      await taskApi.exportTasksCsv(exportParams);
      setNotification({
        type: 'success',
        message: 'Tasks CSV exported successfully!',
      });
    } catch (err) {
      console.error('Export failed:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to export CSV',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const currentFilters = {
    search,
    department,
    priority,
    status,
    dueFrom,
    dueTo,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Task Listing</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage company tasks, assignees, priorities, and workflow status transitions.
          </p>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <TaskFilterBar
          filters={currentFilters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onReset={handleResetFilters}
          onExportCsv={handleExportCsv}
          isExporting={isExporting}
        />

        {/* Table Area */}
        {loading ? (
          <LoadingSpinner text="Fetching tasks from server..." />
        ) : (
          <>
            <TaskTable
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onDeleteClick={(task) => setTaskToDelete(task)}
              updatingTaskId={updatingTaskId}
            />

            {/* Pagination Controls */}
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              label="tasks"
            />
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(taskToDelete)}
        title="Delete Task"
        message={`Are you sure you want to delete task "${taskToDelete?.taskId}: ${taskToDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setTaskToDelete(null)}
      />

      {/* Notification Toast */}
      <NotificationToast
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default TaskListPage;
