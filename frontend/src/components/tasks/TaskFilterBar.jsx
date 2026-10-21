import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Download, RotateCcw } from 'lucide-react';

const DEPARTMENTS = ['All', 'Development', 'Design', 'QA', 'HR', 'Sales'];
const PRIORITIES = ['All', 'Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['All', 'Todo', 'In Progress', 'Completed', 'Cancelled'];

const TaskFilterBar = ({
  filters,
  onFilterChange,
  onSearch,
  onReset,
  onExportCsv,
  isExporting,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Keep search input synced when URL params change
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
    (filters.priority && filters.priority !== 'All') ||
    (filters.status && filters.status !== 'All') ||
    filters.dueFrom ||
    filters.dueTo;

  return (
    <div className="bg-white p-4 rounded-t-lg border-b border-gray-200 shadow-sm space-y-4">
      {/* Top row: Search and Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Search title or employee"
              className="w-full pl-3 pr-8 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 bg-[#4a5568] hover:bg-[#2d3748] text-white text-sm font-medium rounded transition-colors focus:outline-none shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            to="/tasks/add"
            className="inline-flex items-center px-3 py-1.5 bg-[#a33b3b] hover:bg-[#8b2f2f] text-white text-sm font-medium rounded transition-colors shadow-sm focus:outline-none"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </Link>
          <button
            type="button"
            onClick={onExportCsv}
            disabled={isExporting}
            className="inline-flex items-center px-3 py-1.5 bg-[#a33b3b] hover:bg-[#8b2f2f] text-white text-sm font-medium rounded transition-colors shadow-sm focus:outline-none disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-1" />
            {isExporting ? 'Exporting...' : 'Export To Csv'}
          </button>
        </div>
      </div>

      {/* Second row: Dropdown filters & Due date range */}
      <div className="flex flex-wrap items-center gap-3 pt-2 text-sm text-gray-700">
        {/* Department */}
        <div className="flex items-center">
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

        {/* Priority */}
        <div className="flex items-center">
          <select
            value={filters.priority || 'All'}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            className="border border-gray-300 rounded px-2.5 py-1.5 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">Priority (All)</option>
            {PRIORITIES.filter((p) => p !== 'All').map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="flex items-center">
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

        {/* Due date range: from - to */}
        <div className="flex items-center gap-1.5 border border-gray-300 rounded px-2 py-1 bg-white">
          <span className="text-xs text-gray-500 font-medium">Due:</span>
          <input
            type="date"
            value={filters.dueFrom || ''}
            onChange={(e) => onFilterChange('dueFrom', e.target.value)}
            placeholder="From"
            className="text-xs text-gray-700 focus:outline-none bg-transparent"
          />
          <span className="text-gray-400 text-xs">to</span>
          <input
            type="date"
            value={filters.dueTo || ''}
            onChange={(e) => onFilterChange('dueTo', e.target.value)}
            placeholder="To"
            className="text-xs text-gray-700 focus:outline-none bg-transparent"
          />
        </div>

        {/* Reset button */}
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

export default TaskFilterBar;
