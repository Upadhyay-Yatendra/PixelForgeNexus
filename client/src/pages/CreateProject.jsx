import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { projectAPI, userAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { ArrowLeft, Calendar, Users } from "lucide-react";

export default function CreateProject() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    deadline: "",
    lead: user.role === "project_lead" ? user._id : "",
  });

  // Fetch project leads for admin
  const { data: projectLeads } = useQuery(
    "project-leads",
    () => userAPI.getAllUsers(),
    {
      enabled: user.role === "admin",
      select: (data) =>
        data.data.users.filter((u) => u.role === "project_lead"),
    }
  );

  // Create project mutation
  const createMutation = useMutation(
    (projectData) => projectAPI.createProject(projectData),
    {
      onSuccess: (response) => {
        toast.success("Project created successfully");
        navigate(`/projects/${response.data.project._id}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Failed to create project");
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData
    };

    // Validate deadline is in the future
    const deadline = new Date(formData.deadline);
    if (deadline <= new Date()) {
      toast.error("Deadline must be in the future");
      return;
    }

    createMutation.mutate(payload);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Get minimum date (tomorrow) for deadline input
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter project name"
                required
                maxLength="100"
              />
              <p className="mt-1 text-sm text-gray-500">
                Choose a clear, descriptive name for your game project
              </p>
            </div>

            {/* Project Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Project Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe the game project, its goals, and key features..."
                required
                maxLength="1000"
              />
              <p className="mt-1 text-sm text-gray-500">
                Provide a detailed description of the project scope and
                objectives
              </p>
            </div>

            {/* Project Deadline */}
            <div>
              <label
                htmlFor="deadline"
                className="block text-sm font-medium text-gray-700"
              >
                <Calendar className="h-4 w-4 inline mr-1" />
                Project Deadline *
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                min={getMinDate()}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Set a realistic deadline for project completion
              </p>
            </div>

            {/* Project Lead Selection (Admin Only) */}
            {user.role === "admin" && (
              <div>
                <label
                  htmlFor="lead"
                  className="block text-sm font-medium text-gray-700"
                >
                  <Users className="h-4 w-4 inline mr-1" />
                  Project Lead *
                </label>
                <select
                  id="lead"
                  name="lead"
                  value={formData.lead}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select a project lead</option>
                  {projectLeads?.map((lead) => (
                    <option key={lead._id} value={lead._id}>
                      {lead.username} ({lead.email})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Assign a project lead who will manage this project
                </p>
              </div>
            )}

            {/* Project Lead Info (Project Lead Role) */}
            {user.role === "project_lead" && (
              <div>
                <label
                  htmlFor="lead"
                  className="block text-sm font-medium text-gray-700"
                >
                  <Users className="h-4 w-4 inline mr-1" />
                  Project Lead
                </label>

                {/* Hidden input to actually submit lead */}
                <input
                  type="hidden"
                  id="lead"
                  name="lead"
                  value={user._id}
                />

                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-900">{user.username} (You)</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  You will be assigned as the project lead
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {createMutation.isLoading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>

        {/* Project Creation Guidelines */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Project Creation Guidelines
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Choose a unique and descriptive project name</li>
            <li>
              • Provide comprehensive project description including scope and
              objectives
            </li>
            <li>• Set realistic deadlines considering project complexity</li>
            <li>• Projects can be assigned developers after creation</li>
            <li>
              • Document uploads and team management available in project
              details
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
