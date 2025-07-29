import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Navigation links configuration for different user roles
const navLinks = {
  manager: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/dashboard/projects', label: 'Projects' },
    { to: '/dashboard/assignments', label: 'Assignments' },
    { to: '/dashboard/timeline', label: 'Timeline' },
    { to: '/dashboard/skill-gaps', label: 'Skill Gap Analysis' },
    { to: '/dashboard/profile', label: 'Profile' },
  ],
  engineer: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/dashboard/assignments', label: 'My Assignments' },
    { to: '/dashboard/timeline', label: 'Timeline' },
    { to: '/dashboard/profile', label: 'Profile' },
  ],
};

// Sidebar component handles navigation menu and user role-based access
const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Return null if no user is authenticated
  if (!user) return null;
  
  // Get navigation links based on user role
  const links = navLinks[user.role] || [];

  return (
    <>
      {/* Hamburger Menu - Only show when sidebar is closed */}
      {!isOpen && (
        <div className="lg:hidden">
          <button
            onClick={() => setIsOpen(true)}
            className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40
          w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b flex items-center justify-between">
            <span className="font-bold text-xl">RMS</span>
            {/* Close button - Only show on mobile when sidebar is open */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 rounded hover:bg-blue-100 transition-colors ${
                  location.pathname === link.to ? 'bg-blue-200 font-semibold' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            <button
              onClick={logout}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar; 