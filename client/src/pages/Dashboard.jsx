import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI, userAPI } from '../services/api';
import { 
  PlusIcon, 
  UsersIcon, 
  FolderIcon, 
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon 
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: projects, isLoading: projectsLoading } = useQuery(
    'projects',
    () => user.role === 'developer' ? projectAPI.getMyProjects() : projectAPI.getAllProjects(),
    { select: (data) => data.data.projects }
  );

  const { data: users, isLoading: usersLoading } = useQuery(
    'users',
    () => userAPI.getAllUsers(),
    { 
      enabled: user.role === 'admin',
      select: (data) => data.data.users 
    }
  );

  const canCreateProject = user.role === 'admin' || user.role === 'project_lead';
  const canManageUsers = user.role === 'admin';

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.username}
          </h1>
          <p className="text-gray-600 mt-1">
            {user.role === 'admin' && 'System Administrator'}
            {user.role === 'project_lead' && 'Project Lead'}
            {user.role === 'developer' && 'Developer'}
          </p>
        </div>
        
        <div className="flex space-x-3">
          {canCreateProject && (
            <Link
              to="/projects/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Project
            </Link>
          )}
          
          {canManageUsers && (
            <Link
              to="/users"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <UsersIcon className="h-4 w-4 mr-2" />
              Manage Users
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FolderIcon className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">
                {projectsLoading ? '...' : projects?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {projectsLoading ? '...' : projects?.filter(p => p.status === 'completed').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {projectsLoading ? '...' : projects?.filter(p => p.status === 'active').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {user.role === 'developer' ? 'My Projects' : 'All Projects'}
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {projectsLoading ? (
            <div className="p-6 text-center text-gray-500">Loading projects...</div>
          ) : projects?.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No projects found
            </div>
          ) : (
            projects?.map((project) => (
              <div key={project._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/projects/${project._id}`}
                        className="text-lg font-medium text-indigo-600 hover:text-indigo-900"
                      >
                        {project.name}
                      </Link>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        Deadline: {formatDate(project.deadline)}
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="h-4 w-4 mr-1" />
                        {project.assignedDevelopers?.length || 0} developers
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/projects/${project._id}`}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Users Section (Admin Only) */}
      {canManageUsers && (
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Users</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {usersLoading ? (
              <div className="p-6 text-center text-gray-500">Loading users...</div>
            ) : users?.slice(0, 5).map((user) => (
              <div key={user._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{user.username}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'project_lead' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
