import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Users, CheckSquare, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'text-white bg-gray-800 shadow-sm'
        : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
    }`;

  return (
    <nav className="bg-[#1f242b] border-b border-gray-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left navigation links */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <NavLink to="/" end className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/employees" className={navLinkClass}>
              Employees
            </NavLink>
            <NavLink to="/tasks" className={navLinkClass}>
              Tasks
            </NavLink>
          </div>

          {/* Center / Right Brand Title */}
          <div className="hidden md:flex items-center">
            <span className="text-gray-200 font-semibold tracking-wide text-sm lg:text-base">
              MERN stack developer practical task
            </span>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white p-1 rounded-md focus:outline-none"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#262c35] px-4 pt-2 pb-3 space-y-1 border-t border-gray-700">
          <NavLink
            to="/"
            end
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:bg-gray-700"
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/employees"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:bg-gray-700"
          >
            Employees
          </NavLink>
          <NavLink
            to="/tasks"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:bg-gray-700"
          >
            Tasks
          </NavLink>
          <div className="pt-2 border-t border-gray-700 text-xs text-gray-400">
            MERN stack developer practical task
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
