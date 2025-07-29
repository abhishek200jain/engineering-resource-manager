import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const NotAuthorized: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex justify-center items-center min-h-[80vh] w-full">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6">
          <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          {user ? (
            <>
              Sorry, <span className="font-medium capitalize">{user.role}</span>s don't have permission to access this page.
            </>
          ) : (
            "You don't have permission to access this page."
          )}
        </p>
        <div className="space-y-3">
          <Link
            to="/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
          <div className="text-sm text-gray-500">
            If you believe this is an error, please contact your administrator.
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotAuthorized; 