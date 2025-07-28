import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({children, requiredRole=null}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-32 w-32 rounded-full border-b-2 border-blue-600"/>
      </div>
    );

  if (!user) return <Navigate to="/login" state={{from:location}} replace/>;

  if (requiredRole) {
    const ok = Array.isArray(requiredRole)
      ? requiredRole.includes(user.role)
      : user.role===requiredRole;
    if (!ok)
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">403</h1>
            <p className="text-gray-600">Access denied</p>
          </div>
        </div>
      );
  }
  return children;
}
