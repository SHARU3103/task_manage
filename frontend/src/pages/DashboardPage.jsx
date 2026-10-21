import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api/dashboardApi';
import StatCard from '../components/dashboard/StatCard';
import WorkloadTable from '../components/dashboard/WorkloadTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Calculating dashboard metrics from server..." />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorAlert message={error} />
        <button
          onClick={fetchStats}
          className="mt-2 px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { employees = {}, tasks = {}, employeeWorkload = [] } = stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Real-time company overview and employee workloads calculated on the server.
        </p>
      </div>

      {/* Employee Stats Row */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Employee Metrics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Employees"
            value={employees.total}
            colorClass="text-gray-900"
            onClick={() => navigate('/employees')}
          />
          <StatCard
            title="Active"
            value={employees.active}
            colorClass="text-emerald-600"
            onClick={() => navigate('/employees?status=Active')}
          />
          <StatCard
            title="Inactive"
            value={employees.inactive}
            colorClass="text-gray-600"
            onClick={() => navigate('/employees?status=Inactive')}
          />
          <StatCard
            title="On Leave"
            value={employees.onLeave}
            colorClass="text-amber-600"
            onClick={() => navigate('/employees?status=On%20Leave')}
          />
        </div>
      </div>

      {/* Task Stats Row */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Task Metrics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Tasks"
            value={tasks.total}
            colorClass="text-gray-900"
            onClick={() => navigate('/tasks')}
          />
          <StatCard
            title="Todo"
            value={tasks.todo}
            colorClass="text-gray-700"
            onClick={() => navigate('/tasks?status=Todo')}
          />
          <StatCard
            title="In Progress"
            value={tasks.inProgress}
            colorClass="text-blue-600"
            onClick={() => navigate('/tasks?status=In%20Progress')}
          />
          <StatCard
            title="Completed"
            value={tasks.completed}
            colorClass="text-emerald-600"
            onClick={() => navigate('/tasks?status=Completed')}
          />
          <StatCard
            title="Cancelled"
            value={tasks.cancelled}
            colorClass="text-amber-700"
            onClick={() => navigate('/tasks?status=Cancelled')}
          />
          <StatCard
            title="Overdue"
            value={tasks.overdue}
            colorClass="text-red-600"
            subtitle="Needs attention"
            onClick={() => navigate('/tasks?status=In%20Progress')}
          />
        </div>
      </div>

      {/* Employee Workload Table */}
      <div>
        <WorkloadTable workloads={employeeWorkload} />
      </div>
    </div>
  );
};

export default DashboardPage;
