import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { employeeApi } from '../api/employeeApi';
import EmployeeFilterBar from '../components/employees/EmployeeFilterBar';
import EmployeeTable from '../components/employees/EmployeeTable';
import Pagination from '../components/common/Pagination';
import ConfirmModal from '../components/common/ConfirmModal';
import NotificationToast from '../components/common/NotificationToast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EmployeeListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const department = searchParams.get('department') || 'All';
  const status = searchParams.get('status') || 'All';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '5', 10);

  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 5, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
      };
      if (search) params.search = search;
      if (department && department !== 'All') params.department = department;
      if (status && status !== 'All') params.status = status;

      const res = await employeeApi.getEmployees(params);
      setEmployees(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to load employees',
      });
    } finally {
      setLoading(false);
    }
  }, [search, department, status, page, limit]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const updateUrlParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { ...current, ...newParams };

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

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    try {
      await employeeApi.deleteEmployee(employeeToDelete._id);
      setNotification({
        type: 'success',
        message: `Employee ${employeeToDelete.fullName} (${employeeToDelete.employeeId}) deleted successfully.`,
      });
      setEmployeeToDelete(null);
      fetchEmployees();
    } catch (err) {
      // Show business rule error (e.g. Cannot delete employee with active tasks)
      setNotification({
        type: 'error',
        message: err.message || 'Failed to delete employee',
      });
      setEmployeeToDelete(null);
    }
  };

  const currentFilters = {
    search,
    department,
    status,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Directory</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage staff profiles, active workload capacities, and availability schedules.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <EmployeeFilterBar
          filters={currentFilters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onReset={handleResetFilters}
        />

        {loading ? (
          <LoadingSpinner text="Fetching employees from server..." />
        ) : (
          <>
            <EmployeeTable
              employees={employees}
              onDeleteClick={(emp) => setEmployeeToDelete(emp)}
            />

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              label="employees"
            />
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(employeeToDelete)}
        title="Delete Employee"
        message={`Are you sure you want to delete ${employeeToDelete?.fullName} (${employeeToDelete?.employeeId})? Note: Employees with active tasks (Todo / In Progress) cannot be deleted under company policy.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setEmployeeToDelete(null)}
      />

      {/* Notification Toast */}
      <NotificationToast
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default EmployeeListPage;
