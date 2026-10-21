import React from 'react';
import { Link } from 'react-router-dom';

const WorkloadTable = ({ workloads = [] }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200">
        <h3 className="text-base font-bold text-gray-900">Employee Workload</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Calculated on the server. Capacity limit is 3 active tasks (Todo + In Progress) per employee.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-[#1f242b] text-white">
            <tr>
              <th scope="col" className="px-5 py-3 text-left font-semibold text-xs uppercase tracking-wider">
                Employee
              </th>
              <th scope="col" className="px-5 py-3 text-right font-semibold text-xs uppercase tracking-wider w-36">
                Active Tasks
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {workloads.length === 0 ? (
              <tr>
                <td colSpan="2" className="px-5 py-6 text-center text-gray-500 text-xs">
                  No active workloads currently.
                </td>
              </tr>
            ) : (
              workloads.map((item, idx) => {
                const isMax = item.activeTasks >= 3;
                return (
                  <tr key={item._id || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {item._id ? (
                        <Link
                          to={`/employees/${item._id}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {item.employeeName}
                        </Link>
                      ) : (
                        item.employeeName
                      )}
                      {item.department && item.department !== 'N/A' && (
                        <span className="text-xs text-gray-400 ml-2 font-normal">
                          ({item.department})
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
                          isMax
                            ? 'bg-red-100 text-red-800'
                            : item.activeTasks > 0
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.activeTasks}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkloadTable;
