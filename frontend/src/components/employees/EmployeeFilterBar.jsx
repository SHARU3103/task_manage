import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RotateCcw } from 'lucide-react';

const DEPARTMENTS = ['All', 'Development', 'Design', 'QA', 'HR', 'Sales'];
const STATUSES = ['All', 'Active', 'Inactive', 'On Leave'];

const EmployeeFilterBar = ({
  filters,
  onFilterChange,
  onSearch,
  onReset,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(searchInput);
    }
  };

  const hasActiveFilters =
    filters.search ||
    (filters.department && filters.department !== 'All') ||
    (filters.status && filters.status !== 'All');

  return (
    <div className="bg-white p-4 rounded-t-lg border-b border-gray-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Search name, ID, email or role"
            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-[#4a5568] hover:bg-[#2d3748] text-white text-sm font-medium rounded transition-colors focus:outline-none shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Action button */}
        <div>
          <Link
            to="/employees/add"
            className="inline-flex items-center px-3 py-1.5 bg-[#a33b3b] hover:bg-[#8b2f2f] text-white text-sm font-medium rounded transition-colors shadow-sm focus:outline-none"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Employee
          </Link>
        </div>
      </div>

      {/* Row 2: Filters */}
      <div className="flex flex-wrap items-center gap-3 pt-2 text-sm text-gray-700">
        <div>
          <select
            value={filters.department || 'All'}
            onChange={(e) => onFilterChange('department', e.target.value)}
            className="border border-gray-300 rounded px-2.5 py-1.5 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">Department (All)</option>
            {DEPARTMENTS.filter((d) => d !== 'All').map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filters.status || 'All'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="border border-gray-300 rounded px-2.5 py-1.5 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">Status (All)</option>
            {STATUSES.filter((s) => s !== 'All').map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded transition-colors focus:outline-none"
            title="Reset All Filters"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default EmployeeFilterBar;
