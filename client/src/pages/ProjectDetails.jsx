import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { projectAPI, documentAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  UploadIcon,
  DownloadIcon,
  TrashIcon,
  UserPlusIcon,
  UserMinusIcon,
  CalendarIcon,
  UsersIcon,
  FileText 
} from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Fetch project details
  const { data: project, isLoading } = useQuery(
    ['project', id],
    () => projectAPI.getProjectById(id),
    { select: (data) => data.data.project }
  );

  // Fetch project documents
  const { data: documents } = useQuery(
    ['documents', id],
    () => documentAPI.getProjectDocuments(id),
    { select: (data) => data.data.documents }
  );

  // Fetch all users for assignment
  const { data: users } = useQuery(
    'users',
    () => userAPI.getAllUsers(),
    { 
      enabled: user.role === 'admin' || user.role === 'project_lead',
      select: (data) => data.data.users.filter(u => u.role === 'developer')
    }
  );

  // Upload document mutation
  const uploadMutation = useMutation(
    (formData) => documentAPI.uploadDocument(id, formData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['documents', id]);
        setSelectedFile(null);
        toast.success('Document uploaded successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Upload failed');
      }
    }
  );

  // Delete document mutation
  const deleteMutation = useMutation(
    (docId) => documentAPI.deleteDocument(docId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['documents', id]);
        toast.success('Document deleted');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Delete failed');
      }
    }
  );

  // Assign developer mutation
  const assignMutation = useMutation(
    (developerId) => projectAPI.assignDeveloper(id, developerId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['project', id]);
        setShowAssignModal(false);
        toast.success('Developer assigned');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Assignment failed');
      }
    }
  );

  // Remove developer mutation
  const removeMutation = useMutation(
    (developerId) => projectAPI.removeDeveloper(id, developerId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['project', id]);
        toast.success('Developer removed');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Removal failed');
      }
    }
  );

  const handleFileUpload = (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('document', selectedFile);
    uploadMutation.mutate(formData);
  };

  const handleDownload = async (doc) => {
    try {
      const response = await documentAPI.downloadDocument(doc._id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.originalName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const canUpload = user.role === 'admin' || 
    (user.role === 'project_lead' && project?.lead?._id === user._id);
  
  const canAssign = user.role === 'admin' || 
    (user.role === 'project_lead' && project?.lead?._id === user._id);

  if (isLoading) {
    return <div className="p-6 text-center">Loading project...</div>;
  }

  if (!project) {
    return <div className="p-6 text-center text-red-600">Project not found</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Deadline: {new Date(project.deadline).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <UsersIcon className="h-4 w-4 mr-1" />
                {project.assignedDevelopers?.length || 0} developers
              </div>
            </div>
          </div>
        </div>
        
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          project.status === 'active' ? 'bg-green-100 text-green-800' :
          project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {project.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Project Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
          </div>

          {/* Documents Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Documents</h2>
              {canUpload && (
                <label className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload File
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />
                </label>
              )}
            </div>

            {selectedFile && (
              <form onSubmit={handleFileUpload} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Selected: {selectedFile.name}
                  </span>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploadMutation.isLoading}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {uploadMutation.isLoading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {documents?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No documents uploaded</p>
              ) : (
                documents?.map((doc) => (
                  <div key={doc._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DocumentIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{doc.originalName}</p>
                        <p className="text-sm text-gray-500">
                          Uploaded by {doc.uploadedBy?.username} • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-1 text-indigo-600 hover:text-indigo-900"
                      >
                        <DownloadIcon className="h-4 w-4" />
                      </button>
                      {canUpload && (
                        <button
                          onClick={() => deleteMutation.mutate(doc._id)}
                          className="p-1 text-red-600 hover:text-red-900"
                          disabled={deleteMutation.isLoading}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="space-y-6">
          {/* Project Lead */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Project Lead</h3>
            {project.lead ? (
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-medium">
                    {project.lead.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{project.lead.username}</p>
                  <p className="text-sm text-gray-600">{project.lead.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No lead assigned</p>
            )}
          </div>

          {/* Assigned Developers */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Assigned Developers</h3>
              {canAssign && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="p-2 text-indigo-600 hover:text-indigo-900"
                >
                  <UserPlusIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {project.assignedDevelopers?.length === 0 ? (
                <p className="text-gray-500">No developers assigned</p>
              ) : (
                project.assignedDevelopers?.map((dev) => (
                  <div key={dev._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm font-medium">
                          {dev.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{dev.username}</p>
                        <p className="text-xs text-gray-600">{dev.email}</p>
                      </div>
                    </div>
                    
                    {canAssign && (
                      <button
                        onClick={() => removeMutation.mutate(dev._id)}
                        className="p-1 text-red-600 hover:text-red-900"
                        disabled={removeMutation.isLoading}
                      >
                        <UserMinusIcon className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Developer Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Assign Developer</h3>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {users?.filter(u => !project.assignedDevelopers?.some(dev => dev._id === u._id))
                .map((user) => (
                <button
                  key={user._id}
                  onClick={() => assignMutation.mutate(user._id)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border"
                  disabled={assignMutation.isLoading}
                >
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
